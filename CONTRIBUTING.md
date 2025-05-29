# Contributing to GovWhiz

Thank you for your interest in contributing to GovWhiz! We aim to make UK legislation and government more accessible to everyone, and we welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/GovWhiz.git
cd GovWhiz
```

3. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Development Process

1. Create a branch for your feature:
```bash
git checkout -b feature/my-feature
```

2. Make your changes, following our coding standards:
   - Use Black for Python code formatting
   - Follow PEP 8 guidelines
   - Write meaningful commit messages
   - Add tests for new features

3. Run tests locally:
```bash
pytest
```

4. Push your changes:
```bash
git push origin feature/my-feature
```

5. Open a Pull Request

## Code Standards

- Use type hints in Python code
- Document functions and classes with docstrings
- Keep functions focused and single-purpose
- Write unit tests for new functionality
- Use meaningful variable and function names

## Testing

We use pytest for testing. Run the test suite with:
```bash
pytest
```

For coverage report:
```bash
pytest --cov=. --cov-report=term-missing
```

## API Guidelines

- Follow RESTful principles
- Document new endpoints using docstrings
- Include error handling
- Add proper validation
- Update API documentation

## Reporting Issues

Report issues using GitHub Issues. Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## Security

- Never commit sensitive data (API keys, credentials)
- Report security vulnerabilities privately
- Follow secure coding practices
- Use environment variables for configuration

## Questions?

Join our community discussions or reach out to maintainers.
