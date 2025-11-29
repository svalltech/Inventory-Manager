#!/usr/bin/env python3
"""
Backend API Testing for Inventory Management System
Tests all inventory CRUD operations and authentication
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://gear-inventory-hub.preview.emergentagent.com/api"
TEST_CREDENTIALS = {
    "email": "admin@inventory.com",
    "password": "admin123"
}

class InventoryAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.headers = {"Content-Type": "application/json"}
        self.test_item_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 400
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, str(e), 0
    
    def test_authentication(self):
        """Test login with admin credentials"""
        print("\n=== Testing Authentication ===")
        
        success, response, status_code = self.make_request("POST", "/auth/login", TEST_CREDENTIALS)
        
        if success and status_code == 200:
            if "access_token" in response:
                self.auth_token = response["access_token"]
                user_info = response.get("user", {})
                self.log_test(
                    "Authentication", 
                    True, 
                    f"Login successful for {user_info.get('email', 'unknown')} with role {user_info.get('role', 'unknown')}"
                )
                return True
            else:
                self.log_test("Authentication", False, "No access token in response", response)
                return False
        else:
            self.log_test("Authentication", False, f"Login failed (Status: {status_code})", response)
            return False
    
    def test_filter_options(self):
        """Test GET /api/inventory/filter-options"""
        print("\n=== Testing Filter Options ===")
        
        success, response, status_code = self.make_request("GET", "/inventory/filter-options")
        
        if success and status_code == 200:
            required_keys = ["brands", "warehouses", "categories", "genders", "colors", "sizes", "designs"]
            missing_keys = [key for key in required_keys if key not in response]
            
            if not missing_keys:
                self.log_test(
                    "Filter Options", 
                    True, 
                    f"All filter options returned successfully. Brands: {len(response.get('brands', []))}, Warehouses: {len(response.get('warehouses', []))}"
                )
                return True
            else:
                self.log_test("Filter Options", False, f"Missing keys: {missing_keys}", response)
                return False
        else:
            self.log_test("Filter Options", False, f"Request failed (Status: {status_code})", response)
            return False
    
    def test_create_inventory_item(self):
        """Test POST /api/inventory - Create new inventory item"""
        print("\n=== Testing Create Inventory Item ===")
        
        timestamp = int(time.time())
        test_item = {
            "sku": f"TEST-SKU-{timestamp}",
            "name": "Test Nike T-Shirt",
            "brand": "Nike",
            "warehouse": "Main Warehouse",
            "category": "T-Shirt",
            "gender": "male",
            "color": "Blue",
            "color_code": "#0000FF",
            "fabric_specs": {
                "material": "Cotton",
                "weight": "200g",
                "composition": "100% Cotton"
            },
            "size": "M(40)",
            "design": "Solid",
            "mrp": 1500.0,
            "selling_price": 1200.0,
            "cost_price": 800.0,
            "quantity": 50,
            "low_stock_threshold": 10,
            "status": "active"
        }
        
        success, response, status_code = self.make_request("POST", "/inventory", test_item)
        
        if success and status_code in [200, 201]:
            if "id" in response:
                self.test_item_id = response["id"]
                self.log_test(
                    "Create Inventory Item", 
                    True, 
                    f"Item created successfully with ID: {self.test_item_id}, SKU: {response.get('sku')}"
                )
                return True
            else:
                self.log_test("Create Inventory Item", False, "No ID in response", response)
                return False
        else:
            self.log_test("Create Inventory Item", False, f"Creation failed (Status: {status_code})", response)
            return False
    
    def test_get_all_inventory(self):
        """Test GET /api/inventory - Get all inventory items"""
        print("\n=== Testing Get All Inventory ===")
        
        success, response, status_code = self.make_request("GET", "/inventory")
        
        if success and status_code == 200:
            if isinstance(response, list):
                # Check if our test item is in the list
                test_item_found = False
                if self.test_item_id:
                    test_item_found = any(item.get("id") == self.test_item_id for item in response)
                
                self.log_test(
                    "Get All Inventory", 
                    True, 
                    f"Retrieved {len(response)} items. Test item found: {test_item_found}"
                )
                return True
            else:
                self.log_test("Get All Inventory", False, "Response is not a list", response)
                return False
        else:
            self.log_test("Get All Inventory", False, f"Request failed (Status: {status_code})", response)
            return False
    
    def test_update_inventory_item(self):
        """Test PUT /api/inventory/{id} - Update inventory item"""
        print("\n=== Testing Update Inventory Item ===")
        
        if not self.test_item_id:
            self.log_test("Update Inventory Item", False, "No test item ID available for update")
            return False
        
        update_data = {
            "quantity": 75,
            "selling_price": 1100.0,
            "brand": "Nike Updated",
            "warehouse": "Secondary Warehouse",
            "fabric_specs": {
                "material": "Cotton Blend",
                "weight": "220g",
                "composition": "80% Cotton, 20% Polyester"
            }
        }
        
        success, response, status_code = self.make_request("PUT", f"/inventory/{self.test_item_id}", update_data)
        
        if success and status_code == 200:
            # Verify the updates
            updated_correctly = (
                response.get("quantity") == 75 and
                response.get("selling_price") == 1100.0 and
                response.get("brand") == "Nike Updated" and
                response.get("warehouse") == "Secondary Warehouse"
            )
            
            if updated_correctly:
                self.log_test(
                    "Update Inventory Item", 
                    True, 
                    f"Item updated successfully. New quantity: {response.get('quantity')}, New price: {response.get('selling_price')}"
                )
                return True
            else:
                self.log_test("Update Inventory Item", False, "Update values not reflected correctly", response)
                return False
        else:
            self.log_test("Update Inventory Item", False, f"Update failed (Status: {status_code})", response)
            return False
    
    def test_filter_and_search(self):
        """Test GET /api/inventory with various filters"""
        print("\n=== Testing Filter and Search ===")
        
        test_cases = [
            {"params": {"category": "T-Shirt"}, "name": "Filter by Category"},
            {"params": {"gender": "male"}, "name": "Filter by Gender"},
            {"params": {"brand": "Nike"}, "name": "Filter by Brand"},
            {"params": {"search": "Test"}, "name": "Search by Text"},
            {"params": {"min_price": 1000, "max_price": 2000}, "name": "Filter by Price Range"}
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            success, response, status_code = self.make_request("GET", "/inventory", params=test_case["params"])
            
            if success and status_code == 200 and isinstance(response, list):
                self.log_test(
                    f"Filter: {test_case['name']}", 
                    True, 
                    f"Filter returned {len(response)} items"
                )
            else:
                self.log_test(
                    f"Filter: {test_case['name']}", 
                    False, 
                    f"Filter failed (Status: {status_code})", 
                    response
                )
                all_passed = False
        
        return all_passed
    
    def test_get_single_item(self):
        """Test GET /api/inventory/{id} - Get single inventory item"""
        print("\n=== Testing Get Single Item ===")
        
        if not self.test_item_id:
            self.log_test("Get Single Item", False, "No test item ID available")
            return False
        
        success, response, status_code = self.make_request("GET", f"/inventory/{self.test_item_id}")
        
        if success and status_code == 200:
            if response.get("id") == self.test_item_id:
                self.log_test(
                    "Get Single Item", 
                    True, 
                    f"Retrieved item: {response.get('name')} (SKU: {response.get('sku')})"
                )
                return True
            else:
                self.log_test("Get Single Item", False, "Item ID mismatch", response)
                return False
        else:
            self.log_test("Get Single Item", False, f"Request failed (Status: {status_code})", response)
            return False
    
    def test_inventory_stats(self):
        """Test GET /api/inventory/stats/summary"""
        print("\n=== Testing Inventory Stats ===")
        
        success, response, status_code = self.make_request("GET", "/inventory/stats/summary")
        
        if success and status_code == 200:
            required_fields = ["total_items", "total_quantity", "low_stock_items", "categories_count", "total_value"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_test(
                    "Inventory Stats", 
                    True, 
                    f"Stats retrieved: {response.get('total_items')} items, {response.get('categories_count')} categories, Total value: {response.get('total_value')}"
                )
                return True
            else:
                self.log_test("Inventory Stats", False, f"Missing fields: {missing_fields}", response)
                return False
        else:
            self.log_test("Inventory Stats", False, f"Request failed (Status: {status_code})", response)
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Backend API Tests for Inventory Management System")
        print(f"🔗 Base URL: {self.base_url}")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("Authentication", self.test_authentication),
            ("Filter Options", self.test_filter_options),
            ("Create Inventory Item", self.test_create_inventory_item),
            ("Get All Inventory", self.test_get_all_inventory),
            ("Update Inventory Item", self.test_update_inventory_item),
            ("Get Single Item", self.test_get_single_item),
            ("Filter and Search", self.test_filter_and_search),
            ("Inventory Stats", self.test_inventory_stats)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test threw exception: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Main test execution"""
    tester = InventoryAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    exit(main())