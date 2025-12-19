# Changelog

## [v0.8.2] - 2025-12-19

### Tweaks
-   **Ingredient Colors**: Reverted ingredient names to white/gray in dark mode for better contrast, keeping only the quantity/unit in the new light purple color.

## [v0.8.1] - 2025-12-19

### Tweaks
-   **Dark Mode**: Updated ingredient text color (name and amount) to light purple (`text-purple-400`) in dark mode for better visibility and aesthetics.

## [v0.8.0] - 2025-12-19

### UX Improvements
-   **Column Reordering**: Swapped "Preparation" and "Ingredients" columns in the individual recipe view.
    -   Ingredients now appear on the left (desktop) to align with common reading patterns.
    -   On mobile, Ingredients consistently appear before Instructions.

## [v0.7.0] - 2025-12-19

### Features
-   **Interactive Scaling**: Ingredient quantities in the recipe view are now editable.
    -   Changing an ingredient amount automatically recalculates the servings and scales all other ingredients.
    -   Servings display now supports decimal values for precision (e.g., 4.5 servings).

### Fixes
-   **Hydration Errors**: Fixed hydration mismatch errors caused by browser extensions (like Dark Reader) by enforcing `darkreader-lock` and suppressing warnings on critical elements.

## [v0.6.0] - 2025-12-19

### Features
-   **Pagination**: Implemented pagination for the recipe list.
    -   Limits display to 50 recipes per page to improve performance with large datasets.
    -   Added "Previous" and "Next" navigation controls.
    -   Maintains filter context (search, category, etc.) while navigating pages.

## [v0.5.0] - 2025-12-19

### Features
-   **Restore Logging**: Added real-time log viewer during backup restore.
    -   Shows detailed progress of actions (extracting, restoring database, images).
    -   Streamed response for instant feedback.
-   **Restore UX**: Improved restore experience.
    -   Removed auto-reload to allow reading logs.
    -   Added manual "Finalizar y Recargar" button.

## [v0.4.1] - 2025-12-19

### Features
-   **iOS Home Screen Icon**: Added support for "Add to Home Screen" on iPhone/iPad using the app logo.

## [v0.4.0] - 2025-12-19

### Features
-   **Text Resizing**: Added A+/A- text size controls with 3 levels (Normal, Large, Huge).
    -   Controls located in recipe metadata row for easy access.
    -   Persistently scales ingredients, instructions, and notes.
-   **Case-Insensitive Login**: Username login is now case-insensitive (e.g., `Mikines` = `mikines`).
-   **Unsaved Changes Warning**: Added robust protection against accidental data loss.
    -   Warns when closing the tab or refreshing.
    -   Warns when clicking internal links (menu, logo, etc.) if the form is dirty.

### UX Improvements
-   **Ingredients Header**: Renamed "Ingredientes" to "Ingred." for cleaner mobile display.
-   **Text Controls Position**: Moved A+/A- controls to the start of the metadata row (left of the date).

## [v0.3.1] - 2025-12-19

### Tweaks
-   **Responsive Layout**: Improved mobile layout for better readability.
    -   Combined title and resizing controls into a single block, with controls below title on mobile.
    -   Moved Ingredients section to appear **before** Instructions on mobile devices.

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
