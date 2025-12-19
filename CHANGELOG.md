# Changelog

## [v0.3.0] - 2025-12-19

### Features
-   **Mobile Camera Integration**: Added a dedicated "Take Photo" button on mobile devices that directly opens the camera.
    -   Seamlessly integrates with the image cropper and optimization flow.
    -   Uses `capture="environment"` to default to the rear camera.

## [v0.2.1] - 2025-12-19

### Fixes
-   **Production 403 Error**: Whitelisted `recetas.mikines.es` in `allowedOrigins` to fix Server Action rejections.
-   **Cropper Form Submission**: Fixed issue where confirming a crop would accidentally save the recipe.

## [v0.2.0] - 2025-12-19

### Features
-   **Image Optimization**: Added server-side image compression and resizing using `sharp`.
    -   Images are converted to WebP.
    -   Max resolution limited to 1080p.
    -   Quality compressed to 80%.
-   **Image Cropping**: Added interactive image cropper during upload.
    -   Allows zooming and rotating.
    -   Locks aspect ratio to 16:9.
-   **Session Extension**: Extended user session duration to 365 days.
-   **Admin UI**: Added version number display in the admin sidebar.

### Fixes
-   Fixed bug where cropping confirmation would submit the recipe form.

## [v0.1.0] - 2025-12-14

### Initial Release
-   Basic recipe management (CRUD).
-   JSON import/export.
-   Authentication system.
-   Theming support.
