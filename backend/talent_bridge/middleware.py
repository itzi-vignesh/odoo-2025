import logging
import json
import re
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.utils.deprecation import MiddlewareMixin
from django.utils.html import strip_tags
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from django.conf import settings

logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    """
    Security middleware to protect against common attacks
    """
    
    def process_request(self, request):
        """Process incoming requests for security checks"""
        # Check for suspicious headers
        suspicious_headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
        ]
        
        for header in suspicious_headers:
            if header in request.META:
                ip = request.META[header]
                if not self._is_valid_ip(ip):
                    logger.warning(f"Suspicious IP detected: {ip}")
                    return JsonResponse(
                        {"error": "Invalid request"}, 
                        status=400
                    )
        
        # Sanitize request data
        if request.method in ['POST', 'PUT', 'PATCH']:
            self._sanitize_request_data(request)
        
        return None
    
    def _is_valid_ip(self, ip):
        """Validate IP address format"""
        if not ip:
            return False
        
        # Basic IP validation
        ip_pattern = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
        return bool(re.match(ip_pattern, ip))
    
    def _sanitize_request_data(self, request):
        """Sanitize request data to prevent XSS and injection attacks"""
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body.decode('utf-8'))
                sanitized_data = self._sanitize_dict(data)
                request._body = json.dumps(sanitized_data).encode('utf-8')
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass
    
    def _sanitize_dict(self, data):
        """Recursively sanitize dictionary data"""
        if isinstance(data, dict):
            return {k: self._sanitize_value(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_value(item) for item in data]
        else:
            return self._sanitize_value(data)
    
    def _sanitize_value(self, value):
        """Sanitize individual values"""
        if isinstance(value, str):
            # Remove HTML tags
            value = strip_tags(value)
            # Remove potentially harmful content
            value = re.sub(r'<script.*?</script>', '', value, flags=re.IGNORECASE)
            value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
            value = re.sub(r'on\w+\s*=', '', value, flags=re.IGNORECASE)
            # Limit length
            if len(value) > 10000:
                value = value[:10000]
            return value.strip()
        elif isinstance(value, (dict, list)):
            return self._sanitize_dict(value)
        else:
            return value

class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Middleware to handle and log errors consistently
    """
    
    def process_exception(self, request, exception):
        """Handle exceptions and return consistent error responses"""
        logger.error(f"Unhandled exception: {exception}", exc_info=True)
        
        if request.path.startswith('/api/'):
            # API error response
            return JsonResponse({
                'error': 'An unexpected error occurred. Please try again.',
                'detail': str(exception) if settings.DEBUG else None
            }, status=500)
        else:
            # Regular error response
            return JsonResponse({
                'error': 'Something went wrong. Please try again.'
            }, status=500)

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all requests for monitoring
    """
    
    def process_request(self, request):
        """Log incoming requests"""
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR', 'unknown')}")
        return None
    
    def process_response(self, request, response):
        """Log response status"""
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
        return response

def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the error
        logger.error(f"API Error: {exc}", exc_info=True)
        
        # Customize error response
        if isinstance(exc, ValidationError):
            response.data = {
                'error': 'Validation failed',
                'details': response.data
            }
        elif hasattr(exc, 'detail'):
            response.data = {
                'error': str(exc.detail)
            }
        else:
            response.data = {
                'error': 'An unexpected error occurred'
            }
    
    return response 