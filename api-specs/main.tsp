import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "./models/common.tsp";
import "./models/document.tsp";
import "./models/template.tsp";
import "./models/errors.tsp";
import "./services/document-api.tsp";
import "./services/template-api.tsp";
import "./services/health-api.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "ADPA Document Processing API",
})
@server("https://api.adpa.io", "Production server")
@server("https://api-staging.adpa.io", "Staging server")  
@server("http://localhost:3000", "Development server")
namespace ADPA;
