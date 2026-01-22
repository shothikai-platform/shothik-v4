from playwright.sync_api import sync_playwright, expect

def test_buttons(page):
    page.goto("http://localhost:3000/test-buttons")

    # Wait for hydration
    page.wait_for_timeout(2000)

    # Test Copy Button
    copy_btn = page.locator("button[aria-label='Copy to clipboard']")
    expect(copy_btn).to_be_visible()

    # Hover to show tooltip
    copy_btn.hover()
    page.wait_for_timeout(1000)

    # Check tooltip text.
    tooltip_text = page.get_by_role("tooltip").get_by_text("Copy to clipboard")
    expect(tooltip_text).to_be_visible()

    # Move mouse away
    page.mouse.move(0, 0)
    page.wait_for_timeout(500)

    # Test Download Button
    download_btn = page.locator("button[aria-label='Download text']")
    expect(download_btn).to_be_visible()

    download_btn.hover()
    page.wait_for_timeout(1000)
    expect(page.get_by_role("tooltip").get_by_text("Download text")).to_be_visible()

    # Take screenshot of the download tooltip
    page.screenshot(path="verification/buttons_tooltip.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Permissions might help but if not, we skip the click test
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()
        try:
            test_buttons(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
