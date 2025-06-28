var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient<admin_interface_dotnet.Services.TemplateApiService>();
builder.Services.AddSingleton<admin_interface_dotnet.Services.TemplateApiService>();
builder.Services.AddHttpClient<admin_interface_dotnet.Services.HealthApiService>();
builder.Services.AddSingleton<admin_interface_dotnet.Services.HealthApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Template}/{action=Index}/{id?}");

app.Run();
