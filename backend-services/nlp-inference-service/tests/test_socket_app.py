
import unittest
import os
import sys
import importlib
from unittest.mock import patch, MagicMock

# Add the parent directory to sys.path to allow importing socket_app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestSocketAppSecurity(unittest.TestCase):
    def setUp(self):
        # We need to mock the services to avoid loading actual models during test
        self.mock_services = patch.dict(sys.modules, {
            'services': MagicMock(),
            'services.model_loader': MagicMock(),
            'services.paraphrase_engine': MagicMock(),
            'services.text_processor': MagicMock()
        })
        self.mock_services.start()

    def tearDown(self):
        self.mock_services.stop()
        # Clean up imported module to ensure fresh import next time
        if 'socket_app' in sys.modules:
            del sys.modules['socket_app']

    def test_cors_allowed_origins_default(self):
        """Verify that cors_allowed_origins is empty by default (secure)."""
        with patch.dict(os.environ, {}, clear=True):
            import socket_app
            importlib.reload(socket_app)
            # The sio object is created with cors_allowed_origins
            # In python-socketio < 5, it might be directly on server
            # In newer versions, it's passed to EngineIO
            # We check the configured value which is passed to AsyncServer constructor
            # But since we can't easily inspect constructor args of an instantiated object without mocking the class,
            # we can inspect the underlying engineio server if accessible, or trust our manual verification script logic.
            # socket_app.sio is the AsyncServer instance.
            # Its 'eio' attribute is the AsyncServer (EngineIO) instance.
            self.assertEqual(socket_app.sio.eio.cors_allowed_origins, [])

    def test_cors_allowed_origins_configured(self):
        """Verify that cors_allowed_origins is correctly parsed from env var."""
        test_origins = "https://example.com,http://localhost:3000"
        expected = ["https://example.com", "http://localhost:3000"]

        with patch.dict(os.environ, {"ALLOWED_ORIGINS": test_origins}, clear=True):
            import socket_app
            importlib.reload(socket_app)
            self.assertEqual(socket_app.sio.eio.cors_allowed_origins, expected)

if __name__ == '__main__':
    unittest.main()
