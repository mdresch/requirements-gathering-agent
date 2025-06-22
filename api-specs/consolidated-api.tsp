import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "ADPA Document Processing API",
})
@tag("Document Processing")
@server("https://api.adpa.io", "Production server")
@server("https://api-staging.adpa.io", "Staging server")  
@server("http://localhost:3000", "Development server")
namespace ADPA;

// Basic models
model ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: utcDateTime;
}

model ErrorDetail {
  code: string;
  message: string;
  details?: string;
}

model DocumentConversionRequest {
  content: string;
  inputFormat: "markdown" | "html" | "docx" | "pdf";
  outputFormat: "pdf" | "docx" | "html" | "pptx";
  templateId?: string;
}

model DocumentConversionResponse {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  outputFormat: "pdf" | "docx" | "html" | "pptx";
  createdAt: utcDateTime;
  completedAt?: utcDateTime;
}

model ProcessingJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  inputFormat: "markdown" | "html" | "docx" | "pdf";
  outputFormat: "pdf" | "docx" | "html" | "pptx";
  progress: int32;
  message?: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
  completedAt?: utcDateTime;
}

// API Interfaces
@route("/api/v1/documents")
interface DocumentAPI {
  @post
  @route("/convert")
  @summary("Convert Document")
  convertDocument(
    @body request: DocumentConversionRequest
  ): ApiResponse<DocumentConversionResponse> | ErrorDetail;

  @get
  @route("/jobs/{jobId}")
  @summary("Get Job Status")
  getJobStatus(
    @path jobId: string
  ): ApiResponse<ProcessingJob> | ErrorDetail;

  @get
  @route("/download/{jobId}")
  @summary("Download Converted Document")
  downloadDocument(
    @path jobId: string
  ): {
    @header("Content-Type") contentType: string;
    @header("Content-Disposition") contentDisposition: string;
    @body content: bytes;
  } | ErrorDetail;

  @get
  @route("/jobs")
  @summary("List Jobs")
  listJobs(
    @query status?: "pending" | "processing" | "completed" | "failed",
    @query page?: int32 = 1,
    @query limit?: int32 = 10
  ): ApiResponse<ProcessingJob[]> | ErrorDetail;
}

@route("/api/v1/health")
interface HealthAPI {
  @get
  @summary("Health Check")
  health(): {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: utcDateTime;
    version: string;
  };

  @get
  @route("/ready")
  @summary("Readiness Check")
  ready(): {
    status: "ready" | "not-ready";
    timestamp: utcDateTime;
  };
}
