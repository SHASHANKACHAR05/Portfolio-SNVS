import io
import json
import urllib.request
import urllib.error
from datetime import datetime
from typing import List, Dict, Any, Tuple
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter


def serialize_inquiry(msg: Any) -> Dict[str, Any]:
    created_str = ""
    if getattr(msg, "created_at", None):
        if isinstance(msg.created_at, datetime):
            created_str = msg.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        else:
            created_str = str(msg.created_at)
    return {
        "id": msg.id,
        "name": msg.name or "",
        "email": msg.email or "",
        "company": msg.company or "",
        "subject": msg.subject or "",
        "message": msg.message or "",
        "status": "Read" if msg.is_read else "New",
        "received_at": created_str,
    }


def build_inquiries_excel(messages: List[Any]) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Inquiries Inbox"

    headers = ["ID", "Name", "Email", "Company", "Subject", "Message", "Status", "Received At"]
    ws.append(headers)

    # Header styling
    header_fill = PatternFill(start_color="4D6A10", end_color="4D6A10", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_align = Alignment(horizontal="left", vertical="center")
    thin_border = Border(
        left=Side(style="thin", color="D9E2C8"),
        right=Side(style="thin", color="D9E2C8"),
        top=Side(style="thin", color="D9E2C8"),
        bottom=Side(style="thin", color="D9E2C8"),
    )

    ws.row_dimensions[1].height = 28
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_align
        cell.border = thin_border

    # Zebra row fills
    alt_fill = PatternFill(start_color="FAFCF7", end_color="FAFCF7", fill_type="solid")
    new_fill = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type="solid")
    body_font = Font(name="Calibri", size=10, color="121410")
    status_new_font = Font(name="Calibri", size=10, bold=True, color="92400E")
    status_read_font = Font(name="Calibri", size=10, bold=True, color="4D6A10")

    for idx, msg in enumerate(messages, start=2):
        row_data = serialize_inquiry(msg)
        ws.append([
            row_data["id"],
            row_data["name"],
            row_data["email"],
            row_data["company"],
            row_data["subject"],
            row_data["message"],
            row_data["status"],
            row_data["received_at"],
        ])
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=idx, column=col_idx)
            cell.font = body_font
            cell.border = thin_border
            cell.alignment = Alignment(
                horizontal="left",
                vertical="top",
                wrap_text=(col_idx in (5, 6)),
            )
            if idx % 2 == 1:
                cell.fill = alt_fill
            if col_idx == 7:
                if row_data["status"] == "New":
                    cell.fill = new_fill
                    cell.font = status_new_font
                else:
                    cell.font = status_read_font

    # Set clean column widths
    col_widths = [8, 22, 28, 24, 32, 52, 12, 22]
    for col_idx, width in enumerate(col_widths, start=1):
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:H{max(1, len(messages) + 1)}"

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def push_inquiries_to_webhook(
    webhook_url: str,
    messages: List[Any],
    mode: str = "sync_all",
) -> Tuple[bool, str]:
    if not webhook_url or not webhook_url.strip().startswith(("http://", "https://")):
        return False, "Invalid Google Apps Script Webhook URL."

    payload = {
        "mode": mode,
        "rows": [serialize_inquiry(m) for m in messages],
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        webhook_url.strip(),
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            status_code = getattr(resp, "status", 200)
            if 200 <= status_code < 400:
                return True, f"Synced {len(messages)} inquiry row(s) to Google Sheets."
            return False, f"Webhook responded with HTTP {status_code}."
    except urllib.error.HTTPError as e:
        return False, f"Google Sheets webhook HTTP error ({e.code})."
    except Exception as e:
        return False, f"Could not reach Google Sheets webhook: {str(e)}"

