using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Rewrite;
using System.Globalization;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (!builder.Environment.IsDevelopment())
{
    // Configure Data Protection to persist keys to a shared location, which is crucial for web farm scenarios.
    // Keys are protected at rest using the Windows DPAPI.
    builder.Services.AddDataProtection()
#pragma warning disable CA1416 // Validate platform compatibility
        .PersistKeysToFileSystem(new DirectoryInfo(@"C:\\inetpub\\DataProtection-Keys\\<website_domain>"))
        .SetApplicationName("<website_domain>")
        .ProtectKeysWithDpapi();
#pragma warning restore CA1416 // Validate platform compatibility
}

// Redirect 'www' subdomain to the non-'www' version for canonical URLs.
var rewriteOptions = new RewriteOptions().AddRedirectToNonWwwPermanent();
app.UseRewriter(rewriteOptions);

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

// Add middleware to generate a nonce for each request and set security headers.
app.Use(async (context, next) =>
{
    var nonceBytes = new byte[32];
    using (var rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(nonceBytes);
    }
    string nonce = Convert.ToBase64String(nonceBytes);
    context.Items["csp-nonce"] = nonce;

    string csp;
    if (app.Environment.IsDevelopment())
    {
        csp = "default-src 'self'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; " +
              "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://unpkg.com; " +
              "img-src 'self'; " +
              "frame-ancestors 'self'; " +
              "form-action 'self' https://sandbox.payfast.co.za/eng/process https://accounts.google.com;";
    }
    else
    {
        csp = "default-src 'self'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              $"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://unpkg.com; " +
              "connect-src 'self' https://unpkg.com; " +
              "img-src 'self'; " +
              "frame-ancestors 'self'; " +
              "form-action 'self' https://www.payfast.co.za/eng/process https://payment.payfast.io https://accounts.google.com;";
    }

    context.Response.Headers["Content-Security-Policy"] = csp;
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

    // Clean Permissions-Policy: Explicitly disable features we don't use to prevent browser console warnings
    // regarding deprecated features like 'interest-cohort'.
    context.Response.Headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";

    await next();
});

// Configure the application to use a consistent culture (en-US) for number formatting.
// This ensures that decimal points are always treated as periods (.), preventing model binding errors
// in regions that use a comma (,) as the decimal separator.
var supportedCultures = new[] { new CultureInfo("en-US") };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("en-US"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();