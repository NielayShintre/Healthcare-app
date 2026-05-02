from fastapi import APIRouter, UploadFile, File, HTTPException
from models.report import ParsedReport
from services.report_service import ReportService

router = APIRouter()
report_service = ReportService()

@router.post("/reports/upload", response_model=ParsedReport)
async def upload_report(file: UploadFile = File(...)):
    try:
        return await report_service.process_uploaded_file(file)
    except Exception as e:
        print(f"Error during report processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    # In a real app, this would delete from the database/storage
    return {"status": "success", "message": f"Report {report_id} deleted"}

