#!/bin/bash

# Development Automation Script for Shothik AI Platform
# This script automates common development tasks

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${BLUE}Shothik AI Development Automation Script${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Available commands:"
    echo "  setup               - Setup development environment"
    echo "  test                - Run all tests"
    echo "  test:summarization  - Test summarization feature"
    echo "  lint                - Run code linting"
    echo "  format              - Format code"
    echo "  build               - Build the project"
    echo "  start               - Start development servers"
    echo "  docs                - Generate documentation"
    echo "  clean               - Clean build artifacts"
    echo "  help                - Show this help message"
    echo ""
    echo "Options:"
    echo "  --verbose, -v       - Verbose output"
    echo "  --dry-run, -d      - Dry run (show what would be done)"
    echo ""
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    local required="$3"
    
    echo -e "${YELLOW}🔧 ${description}...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would execute: ${cmd}${NC}"
        return 0
    fi
    
    if ! command_exists "$cmd"; then
        if [ "$required" = true ]; then
            echo -e "${RED}❌ Required command not found: $cmd${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  Command not found, skipping: $cmd${NC}"
            return 0
        fi
    fi
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}Executing: ${cmd}${NC}"
    fi
    
    eval "$cmd"
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${description} completed successfully${NC}"
    else
        echo -e "${RED}❌ ${description} failed with exit code $exit_code${NC}"
    fi
    
    return $exit_code
}

# Function to setup development environment
setup_environment() {
    echo -e "${BLUE}🛠️  Setting up development environment...${NC}"
    
    # Check Node.js version
    run_command "node --version" "Checking Node.js version" false
    
    # Check Python version
    run_command "python3 --version" "Checking Python version" false
    
    # Install frontend dependencies
    if [ -f "package.json" ]; then
        run_command "npm install" "Installing frontend dependencies" false
    fi
    
    # Install backend dependencies
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && pip install -r requirements.txt" "Installing backend dependencies" false
    fi
    
    echo -e "${GREEN}✅ Environment setup completed${NC}"
}

# Function to run tests
test_all() {
    echo -e "${BLUE}🧪 Running all tests...${NC}"
    
    # Run frontend tests
    if [ -f "package.json" ]; then
        run_command "npm test" "Running frontend tests" false
    fi
    
    # Run backend tests
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && python -m pytest" "Running backend tests" false
    fi
}

# Function to test summarization feature
test_summarization() {
    echo -e "${BLUE}📝 Testing summarization feature...${NC}"
    
    if [ ! -f "scripts/test_summarization.py" ]; then
        echo -e "${RED}❌ Summarization test script not found${NC}"
        return 1
    fi
    
    run_command "python3 scripts/test_summarization.py" "Running summarization tests" false
}

# Function to run linting
run_linting() {
    echo -e "${BLUE}🔍 Running code linting...${NC}"
    
    # Run frontend linting
    if [ -f "package.json" ]; then
        run_command "npm run lint" "Running frontend linting" false
    fi
    
    # Run backend linting
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && pylint ." "Running backend linting" false
    fi
}

# Function to format code
format_code() {
    echo -e "${BLUE}🎨 Formatting code...${NC}"
    
    # Format frontend code
    if [ -f "package.json" ]; then
        run_command "npm run format" "Formatting frontend code" false
    fi
    
    # Format backend code
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && black ." "Formatting backend code" false
        run_command "cd backend-services/nlp-inference-service && isort ." "Sorting Python imports" false
    fi
}

# Function to build the project
build_project() {
    echo -e "${BLUE}🏗️  Building the project...${NC}"
    
    # Build frontend
    if [ -f "package.json" ]; then
        run_command "npm run build" "Building frontend" false
    fi
    
    # Build backend
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && ./setup-docker-files.sh" "Setting up backend docker files" false
    fi
}

# Function to start development servers
start_servers() {
    echo -e "${BLUE}🚀 Starting development servers...${NC}"
    
    # Start frontend
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}📱 Starting frontend development server...${NC}"
        echo -e "${BLUE}Run in a separate terminal: npm run dev${NC}"
    fi
    
    # Start backend
    if [ -d "backend-services" ]; then
        echo -e "${YELLOW}🖥️  Starting backend development server...${NC}"
        echo -e "${BLUE}Run in a separate terminal: cd backend-services/nlp-inference-service && uvicorn main:app --reload${NC}"
    fi
}

# Function to generate documentation
generate_docs() {
    echo -e "${BLUE}📚 Generating documentation...${NC}"
    
    # Check if documentation tools are available
    if command_exists "pdoc"; then
        run_command "pdoc --html backend-services/nlp-inference-service --output-dir docs/api" "Generating API documentation" false
    else
        echo -e "${YELLOW}⚠️  pdoc not found, skipping API documentation generation${NC}"
    fi
    
    # Check if TypeDoc is available for TypeScript
    if command_exists "typedoc"; then
        run_command "typedoc --out docs/typescript src" "Generating TypeScript documentation" false
    else
        echo -e "${YELLOW}⚠️  TypeDoc not found, skipping TypeScript documentation generation${NC}"
    fi
}

# Function to clean build artifacts
clean_project() {
    echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
    
    # Clean frontend
    if [ -d "node_modules" ]; then
        run_command "rm -rf node_modules" "Removing node_modules" false
    fi
    
    if [ -d ".next" ]; then
        run_command "rm -rf .next" "Removing Next.js build files" false
    fi
    
    # Clean backend
    if [ -d "backend-services" ]; then
        run_command "cd backend-services/nlp-inference-service && rm -rf __pycache__" "Removing Python cache files" false
        run_command "cd backend-services/nlp-inference-service && rm -rf *.pyc" "Removing Python bytecode files" false
    fi
    
    # Clean docs
    if [ -d "docs/api" ]; then
        run_command "rm -rf docs/api" "Removing generated API docs" false
    fi
    
    if [ -d "docs/typescript" ]; then
        run_command "rm -rf docs/typescript" "Removing generated TypeScript docs" false
    fi
}

# Main script execution
main() {
    # Parse command line arguments
    VERBOSE=false
    DRY_RUN=false
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --dry-run|-d)
                DRY_RUN=true
                shift
                ;;
            help)
                show_help
                exit 0
                ;;
            setup)
                setup_environment
                exit $?
                ;;
            test)
                test_all
                exit $?
                ;;
            test:summarization)
                test_summarization
                exit $?
                ;;
            lint)
                run_linting
                exit $?
                ;;
            format)
                format_code
                exit $?
                ;;
            build)
                build_project
                exit $?
                ;;
            start)
                start_servers
                exit $?
                ;;
            docs)
                generate_docs
                exit $?
                ;;
            clean)
                clean_project
                exit $?
                ;;
            *)
                echo -e "${RED}❌ Unknown command: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # If no command provided, show help
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi
}

# Run main function
main "$@"