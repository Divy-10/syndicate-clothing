import time
import os
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configure Edge Options for headless execution
options = EdgeOptions()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1280,1024")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
# Enable console logging capture
options.set_capability("ms:loggingPrefs", {"browser": "ALL"})

# Initialize Webdriver
driver = webdriver.Edge(options=options)

try:
    print("Opening register page...")
    driver.get("http://localhost:5173/register")
    time.sleep(2)

    # Fill register form
    print("Filling register form...")
    email_suffix = str(int(time.time()))
    email = f"test_debug_{email_suffix}@gmail.com"
    password = "password123"

    driver.find_element(By.XPATH, "//input[@placeholder='John Doe']").send_keys("Test Debugger")
    driver.find_element(By.XPATH, "//input[@placeholder='user@gmail.com']").send_keys(email)
    driver.find_element(By.XPATH, "//input[@placeholder='+91 ...']").send_keys("+919999999999")
    driver.find_element(By.XPATH, "//input[@type='date']").send_keys("01-01-2000")
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys(password)

    print("Submitting signup...")
    driver.find_element(By.CLASS_NAME, "btn-submit-app").click()
    
    # Wait for alert and accept it
    WebDriverWait(driver, 5).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    print(f"Signup Alert: {alert.text}")
    alert.accept()
    time.sleep(2)

    # Login
    print("Opening login page...")
    driver.get("http://localhost:5173/login")
    time.sleep(2)
    
    print("Filling login form...")
    driver.find_element(By.XPATH, "//input[@type='email']").send_keys(email)
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys(password)
    
    print("Submitting login...")
    driver.find_element(By.CLASS_NAME, "btn-auth").click()
    
    # Wait for alert and accept it
    WebDriverWait(driver, 5).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    print(f"Login Alert: {alert.text}")
    alert.accept()
    time.sleep(2)

    # Navigate to profile
    print("Navigating to profile...")
    driver.get("http://localhost:5173/profile")
    time.sleep(2)

    # Click Settings tab
    print("Clicking Settings tab...")
    # Find button containing "Settings"
    settings_btn = driver.find_element(By.XPATH, "//button[contains(., 'Settings')]")
    settings_btn.click()
    time.sleep(2)

    # Print current active tab and HTML
    print("Current URL:", driver.current_url)
    
    # Get console logs
    print("\n--- BROWSER CONSOLE LOGS ---")
    logs = driver.get_log("browser")
    for log in logs:
        print(f"[{log['level']}] {log['message']}")
    print("----------------------------\n")

    # Save screenshot
    screenshot_path = r"C:\Users\Admin\.gemini\antigravity\brain\eedc8527-a8e9-4c2e-86e4-1b215782c2f5\settings_debug.png"
    driver.save_screenshot(screenshot_path)
    print(f"Screenshot saved to: {screenshot_path}")

    # Extract form container outerHTML
    try:
        main_content = driver.find_element(By.CLASS_NAME, "profile-main")
        print("\n--- PROFILE MAIN OUTER HTML ---")
        print(main_content.get_attribute("outerHTML"))
        print("--------------------------------\n")
    except Exception as e:
        print("Could not find .profile-main element:", e)

finally:
    driver.quit()
