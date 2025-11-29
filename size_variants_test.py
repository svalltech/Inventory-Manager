#!/usr/bin/env python3
"""
Backend API Testing for "Add Size Variants" Feature
Tests the backend support for adding same product variants in different warehouses
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

class SizeVariantsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.headers = {"Content-Type": "application/json"}
        self.test_results = []
        self.created_items = []  # Track items we create for cleanup
        
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
    
    def authenticate(self):
        """Authenticate and get token"""
        print("🔐 Authenticating...")
        success, response, status_code = self.make_request("POST", "/auth/login", TEST_CREDENTIALS)
        
        if success and status_code == 200 and "access_token" in response:
            self.auth_token = response["access_token"]
            print(f"✅ Authenticated as {response['user']['email']}")
            return True
        else:
            print(f"❌ Authentication failed: {response}")
            return False
    
    def get_available_warehouses(self):
        """Get available warehouses from filter options"""
        success, response, status_code = self.make_request("GET", "/inventory/filter-options")
        
        if success and status_code == 200:
            warehouses = response.get("warehouses", [])
            print(f"📦 Available warehouses: {warehouses}")
            return warehouses
        else:
            print(f"❌ Failed to get warehouses: {response}")
            return []
    
    def test_create_base_product(self):
        """Create a base product (NOM Jogger) in first warehouse"""
        print("\n=== Test 1: Create Base Product ===")
        
        warehouses = self.get_available_warehouses()
        if len(warehouses) < 2:
            self.log_test("Create Base Product", False, "Need at least 2 warehouses for testing")
            return False, None, None
        
        timestamp = int(time.time())
        base_product = {
            "sku": f"NOM-JOGGER-{timestamp}",
            "name": "NOM Jogger",
            "brand": "NOM",
            "warehouse": warehouses[0],  # First warehouse
            "category": "Jogger",
            "gender": "male",
            "color": "Black",
            "color_code": "#000000",
            "fabric_specs": {
                "material": "Cotton Blend",
                "weight": "300g",
                "composition": "70% Cotton, 30% Polyester"
            },
            "size": "XL(44)",
            "design": "Solid",
            "mrp": 2500.0,
            "selling_price": 2000.0,
            "cost_price": 1200.0,
            "quantity": 25,
            "low_stock_threshold": 5,
            "status": "active"
        }
        
        success, response, status_code = self.make_request("POST", "/inventory", base_product)
        
        if success and status_code in [200, 201]:
            item_id = response.get("id")
            self.created_items.append(item_id)
            self.log_test(
                "Create Base Product", 
                True, 
                f"Created NOM Jogger XL(44) in {warehouses[0]} with ID: {item_id}"
            )
            return True, item_id, warehouses
        else:
            self.log_test("Create Base Product", False, f"Failed to create base product (Status: {status_code})", response)
            return False, None, None
    
    def test_get_existing_variants(self, base_sku):
        """Test getting all variants of a product across warehouses"""
        print("\n=== Test 2: Get Existing Variants Across Warehouses ===")
        
        # Search for all items with the same base SKU pattern
        success, response, status_code = self.make_request("GET", "/inventory", params={"search": "NOM-JOGGER"})
        
        if success and status_code == 200:
            variants = [item for item in response if item.get("sku", "").startswith("NOM-JOGGER")]
            
            # Group by warehouse
            warehouse_variants = {}
            for variant in variants:
                warehouse = variant.get("warehouse")
                if warehouse not in warehouse_variants:
                    warehouse_variants[warehouse] = []
                warehouse_variants[warehouse].append({
                    "size": variant.get("size"),
                    "quantity": variant.get("quantity"),
                    "warehouse": warehouse
                })
            
            self.log_test(
                "Get Existing Variants", 
                True, 
                f"Found {len(variants)} variants across {len(warehouse_variants)} warehouses: {list(warehouse_variants.keys())}"
            )
            return True, warehouse_variants
        else:
            self.log_test("Get Existing Variants", False, f"Failed to get variants (Status: {status_code})", response)
            return False, {}
    
    def test_add_same_size_different_warehouse(self, base_sku, warehouses):
        """Test adding same size in different warehouse (should succeed)"""
        print("\n=== Test 3: Add Same Size in Different Warehouse ===")
        
        if len(warehouses) < 2:
            self.log_test("Add Same Size Different Warehouse", False, "Need at least 2 warehouses")
            return False
        
        # Create same size (XL(44)) in second warehouse
        same_size_variant = {
            "sku": base_sku,  # Same SKU
            "name": "NOM Jogger",
            "brand": "NOM",
            "warehouse": warehouses[1],  # Different warehouse
            "category": "Jogger",
            "gender": "male",
            "color": "Black",
            "color_code": "#000000",
            "fabric_specs": {
                "material": "Cotton Blend",
                "weight": "300g",
                "composition": "70% Cotton, 30% Polyester"
            },
            "size": "XL(44)",  # Same size as base product
            "design": "Solid",
            "mrp": 2500.0,
            "selling_price": 2000.0,
            "cost_price": 1200.0,
            "quantity": 30,
            "low_stock_threshold": 5,
            "status": "active"
        }
        
        success, response, status_code = self.make_request("POST", "/inventory", same_size_variant)
        
        if success and status_code in [200, 201]:
            item_id = response.get("id")
            self.created_items.append(item_id)
            self.log_test(
                "Add Same Size Different Warehouse", 
                True, 
                f"Successfully created XL(44) in {warehouses[1]} (different warehouse). ID: {item_id}"
            )
            return True
        else:
            self.log_test("Add Same Size Different Warehouse", False, f"Failed to create variant (Status: {status_code})", response)
            return False
    
    def test_duplicate_prevention_same_warehouse(self, base_sku, warehouses):
        """Test duplicate prevention (same SKU + same warehouse should fail)"""
        print("\n=== Test 4: Test Duplicate Prevention (Same SKU + Same Warehouse) ===")
        
        # Try to create same SKU in same warehouse (should fail)
        duplicate_item = {
            "sku": base_sku,  # Same SKU
            "name": "NOM Jogger Duplicate",
            "brand": "NOM",
            "warehouse": warehouses[0],  # Same warehouse as base product
            "category": "Jogger",
            "gender": "male",
            "color": "Navy",
            "color_code": "#000080",
            "fabric_specs": {
                "material": "Cotton",
                "weight": "250g",
                "composition": "100% Cotton"
            },
            "size": "L(42)",  # Different size but same SKU + warehouse
            "design": "Solid",
            "mrp": 2200.0,
            "selling_price": 1800.0,
            "cost_price": 1000.0,
            "quantity": 20,
            "low_stock_threshold": 5,
            "status": "active"
        }
        
        success, response, status_code = self.make_request("POST", "/inventory", duplicate_item)
        
        # This should fail with 400 status code
        if not success and status_code == 400:
            error_message = response.get("detail", "") if isinstance(response, dict) else str(response)
            if "already exists" in error_message.lower():
                self.log_test(
                    "Duplicate Prevention", 
                    True, 
                    f"Correctly prevented duplicate SKU in same warehouse. Error: {error_message}"
                )
                return True
            else:
                self.log_test("Duplicate Prevention", False, f"Wrong error message: {error_message}")
                return False
        else:
            self.log_test("Duplicate Prevention", False, f"Should have failed but got status {status_code}", response)
            return False
    
    def test_create_multiple_variants_different_warehouses(self, warehouses):
        """Test creating multiple variants with same size in different warehouses"""
        print("\n=== Test 5: Create Multiple Variants in Different Warehouses ===")
        
        if len(warehouses) < 2:
            self.log_test("Multiple Variants Different Warehouses", False, "Need at least 2 warehouses")
            return False
        
        timestamp = int(time.time())
        base_sku = f"MULTI-TEST-{timestamp}"
        
        variants = [
            {
                "sku": base_sku,
                "name": "Multi Test Product",
                "brand": "TestBrand",
                "warehouse": warehouses[0],
                "category": "T-Shirt",
                "gender": "unisex",
                "color": "White",
                "size": "M(40)",
                "design": "Plain",
                "fabric_specs": {"material": "Cotton"},
                "mrp": 500.0,
                "selling_price": 400.0,
                "quantity": 10
            },
            {
                "sku": base_sku,  # Same SKU
                "name": "Multi Test Product",
                "brand": "TestBrand",
                "warehouse": warehouses[1] if len(warehouses) > 1 else warehouses[0],  # Different warehouse
                "category": "T-Shirt",
                "gender": "unisex",
                "color": "White",
                "size": "M(40)",  # Same size
                "design": "Plain",
                "fabric_specs": {"material": "Cotton"},
                "mrp": 500.0,
                "selling_price": 400.0,
                "quantity": 15
            }
        ]
        
        created_count = 0
        for i, variant in enumerate(variants):
            success, response, status_code = self.make_request("POST", "/inventory", variant)
            
            if success and status_code in [200, 201]:
                item_id = response.get("id")
                self.created_items.append(item_id)
                created_count += 1
                print(f"   ✅ Created variant {i+1} in {variant['warehouse']}")
            else:
                print(f"   ❌ Failed to create variant {i+1}: {response}")
        
        if created_count == len(variants):
            self.log_test(
                "Multiple Variants Different Warehouses", 
                True, 
                f"Successfully created {created_count} variants with same size M(40) in different warehouses"
            )
            return True
        else:
            self.log_test(
                "Multiple Variants Different Warehouses", 
                False, 
                f"Only created {created_count} out of {len(variants)} variants"
            )
            return False
    
    def test_warehouse_filter_options(self):
        """Test that warehouse dropdown has multiple options"""
        print("\n=== Test 6: Warehouse Filter Options ===")
        
        success, response, status_code = self.make_request("GET", "/inventory/filter-options")
        
        if success and status_code == 200:
            warehouses = response.get("warehouses", [])
            
            if len(warehouses) >= 2:
                self.log_test(
                    "Warehouse Filter Options", 
                    True, 
                    f"Found {len(warehouses)} warehouses available for selection: {warehouses}"
                )
                return True
            else:
                self.log_test(
                    "Warehouse Filter Options", 
                    False, 
                    f"Only {len(warehouses)} warehouses available. Need at least 2 for variant testing."
                )
                return False
        else:
            self.log_test("Warehouse Filter Options", False, f"Failed to get filter options (Status: {status_code})", response)
            return False
    
    def cleanup_test_items(self):
        """Clean up test items created during testing"""
        print("\n🧹 Cleaning up test items...")
        
        for item_id in self.created_items:
            success, response, status_code = self.make_request("DELETE", f"/inventory/{item_id}")
            if success:
                print(f"   ✅ Deleted item {item_id}")
            else:
                print(f"   ⚠️  Failed to delete item {item_id}: {response}")
    
    def run_size_variants_tests(self):
        """Run all size variants backend tests"""
        print("🚀 Starting Size Variants Backend API Tests")
        print(f"🔗 Base URL: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            return False
        
        # Test sequence
        tests_passed = 0
        total_tests = 6
        
        try:
            # Test 1: Create base product
            success, base_item_id, warehouses = self.test_create_base_product()
            if success:
                tests_passed += 1
                base_sku = f"NOM-JOGGER-{int(time.time())}"
            
            # Test 2: Get existing variants
            if success:
                variant_success, warehouse_variants = self.test_get_existing_variants(base_sku)
                if variant_success:
                    tests_passed += 1
            
            # Test 3: Add same size in different warehouse
            if success and warehouses:
                if self.test_add_same_size_different_warehouse(base_sku, warehouses):
                    tests_passed += 1
            
            # Test 4: Test duplicate prevention
            if success and warehouses:
                if self.test_duplicate_prevention_same_warehouse(base_sku, warehouses):
                    tests_passed += 1
            
            # Test 5: Create multiple variants in different warehouses
            if warehouses:
                if self.test_create_multiple_variants_different_warehouses(warehouses):
                    tests_passed += 1
            
            # Test 6: Warehouse filter options
            if self.test_warehouse_filter_options():
                tests_passed += 1
            
        except Exception as e:
            print(f"❌ Test execution failed with exception: {str(e)}")
        
        finally:
            # Cleanup
            self.cleanup_test_items()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 SIZE VARIANTS TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {tests_passed}")
        print(f"Failed: {total_tests - tests_passed}")
        print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return tests_passed == total_tests

def main():
    """Main test execution"""
    tester = SizeVariantsAPITester()
    success = tester.run_size_variants_tests()
    
    if success:
        print("\n🎉 All Size Variants backend tests passed! APIs support the feature correctly.")
        return 0
    else:
        print("\n⚠️  Some Size Variants tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    exit(main())