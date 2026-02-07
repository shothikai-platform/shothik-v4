from playwright.sync_api import sync_playwright, expect

def verify_research_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the research page
            print("Navigating to /research...")
            response = page.goto("http://localhost:3000/research")

            # Check if page loaded successfully
            print(f"Response status: {response.status}")
            if response.status != 200:
                print("Failed to load page")
                # Take screenshot anyway to see what happened
                page.screenshot(path="verification_failure.png")
                return

            # Wait for the main content to load
            # ResearchContend has "What do you want to explore?" text
            print("Waiting for content...")
            page.wait_for_selector("text=What do you want to explore?", timeout=10000)

            print("Page loaded successfully. Taking screenshot.")
            page.screenshot(path="research_page.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_research_page()
