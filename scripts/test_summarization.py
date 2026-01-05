#!/usr/bin/env python3
"""
Automated testing script for the summarization feature.
This script tests the summarization endpoint with various inputs.
"""

import requests
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = "http://localhost:8000/api/v1"  # Update with your actual backend URL
TEST_CASES = [
    {
        "name": "Short text - medium summary",
        "text": "The quick brown fox jumps over the lazy dog. This is a simple test sentence.",
        "length": "medium",
        "expected_min_length": 10,
        "expected_max_length": 50
    },
    {
        "name": "Medium text - short summary",
        "text": "Artificial intelligence is transforming industries across the globe. From healthcare to finance, AI applications are improving efficiency and accuracy. Machine learning algorithms can analyze vast amounts of data to find patterns that humans might miss. Natural language processing enables computers to understand and generate human language. Computer vision allows machines to interpret visual information from the world.",
        "length": "short",
        "expected_min_length": 5,
        "expected_max_length": 30
    },
    {
        "name": "Long text - long summary",
        "text": """The industrial revolution marked a major turning point in human history. It began in the late 18th century in Britain and spread throughout the world during the 19th century. This period saw the transition from hand production methods to machines, new chemical manufacturing processes, iron production improvements, increased use of steam power, and the development of machine tools. The industrial revolution also led to significant social changes, including urbanization, the rise of the working class, and major shifts in economic systems.

The technological advancements of the industrial revolution had profound effects on society. Factories became the primary centers of production, replacing the domestic system where goods were produced in homes. The steam engine, invented by James Watt, revolutionized transportation and manufacturing. The telegraph enabled rapid long-distance communication for the first time. These changes led to increased productivity and economic growth, but also to significant social upheaval and environmental challenges.

The industrial revolution laid the foundation for modern industrial societies and continues to influence economic and social structures today.""",
        "length": "long",
        "expected_min_length": 50,
        "expected_max_length": 200
    },
    {
        "name": "Technical text - medium summary",
        "text": "Python is a high-level, interpreted programming language known for its readability and versatility. It supports multiple programming paradigms including procedural, object-oriented, and functional programming. Python's extensive standard library and the availability of third-party packages through the Python Package Index (PyPI) make it suitable for a wide range of applications from web development to scientific computing.",
        "length": "medium",
        "expected_min_length": 20,
        "expected_max_length": 100
    }
]

def test_summarization_endpoint(text, length="medium"):
    """Test the summarization endpoint with given text and length."""
    url = f"{BASE_URL}/summarize"
    
    payload = {
        "text": text,
        "length": length,
        "language": "English"
    }
    
    try:
        start_time = time.time()
        response = requests.post(url, json=payload, timeout=30)
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "status_code": response.status_code,
                "summary": result.get("summary", ""),
                "original_length": result.get("original_length", 0),
                "summary_length": result.get("summary_length", 0),
                "processing_time": result.get("processing_time_ms", 0),
                "elapsed_time": elapsed_time * 1000,  # Convert to milliseconds
                "error": None
            }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "summary": "",
                "original_length": 0,
                "summary_length": 0,
                "processing_time": 0,
                "elapsed_time": elapsed_time * 1000,
                "error": response.text
            }
    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "summary": "",
            "original_length": 0,
            "summary_length": 0,
            "processing_time": 0,
            "elapsed_time": 0,
            "error": str(e)
        }

def run_single_test(test_case):
    """Run a single test case."""
    print(f"\n🧪 Running test: {test_case['name']}")
    print(f"   Input length: {len(test_case['text'])} characters")
    print(f"   Target length: {test_case['length']}")
    
    result = test_summarization_endpoint(test_case['text'], test_case['length'])
    
    if result['success']:
        print(f"   ✅ SUCCESS")
        print(f"   Summary length: {result['summary_length']} characters")
        print(f"   Processing time: {result['processing_time']:.2f}ms")
        print(f"   Total time: {result['elapsed_time']:.2f}ms")
        print(f"   Summary: {result['summary'][:100]}...")
        
        # Validate length expectations
        if test_case['expected_min_length'] <= result['summary_length'] <= test_case['expected_max_length']:
            print(f"   ✅ Length within expected range")
        else:
            print(f"   ⚠️  Length outside expected range ({test_case['expected_min_length']}-{test_case['expected_max_length']})")
    else:
        print(f"   ❌ FAILED")
        print(f"   Status code: {result['status_code']}")
        print(f"   Error: {result['error']}")
    
    return result

def run_concurrent_tests(test_cases, max_workers=3):
    """Run multiple tests concurrently."""
    print(f"\n🚀 Running {len(test_cases)} tests with {max_workers} concurrent workers...")
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(run_single_test, test_cases))
    
    total_time = time.time() - start_time
    print(f"\n⏱️  All tests completed in {total_time:.2f} seconds")
    
    # Summary statistics
    successful_tests = sum(1 for r in results if r['success'])
    failed_tests = len(results) - successful_tests
    
    print(f"\n📊 Test Results Summary:")
    print(f"   Total tests: {len(results)}")
    print(f"   Successful: {successful_tests}")
    print(f"   Failed: {failed_tests}")
    
    if failed_tests > 0:
        print(f"\n🔍 Failed tests:")
        for i, result in enumerate(results):
            if not result['success']:
                print(f"   {i+1}. {TEST_CASES[i]['name']}: {result['error']}")

def main():
    parser = argparse.ArgumentParser(description="Test the summarization feature")
    parser.add_argument("--url", help="Base URL of the API endpoint", default=BASE_URL)
    parser.add_argument("--concurrent", help="Run tests concurrently", action="store_true")
    parser.add_argument("--workers", type=int, help="Number of concurrent workers", default=3)
    parser.add_argument("--test-case", type=int, help="Run specific test case by index")
    
    args = parser.parse_args()
    
    global BASE_URL
    BASE_URL = args.url
    
    print("🔧 Summarization Feature Tester")
    print(f"🔗 API Endpoint: {BASE_URL}/summarize")
    print(f"📋 Total test cases: {len(TEST_CASES)}")
    
    if args.test_case is not None:
        if 0 <= args.test_case < len(TEST_CASES):
            run_single_test(TEST_CASES[args.test_case])
        else:
            print(f"❌ Invalid test case index. Please use 0-{len(TEST_CASES)-1}")
    elif args.concurrent:
        run_concurrent_tests(TEST_CASES, args.workers)
    else:
        for test_case in TEST_CASES:
            run_single_test(test_case)

if __name__ == "__main__":
    main()