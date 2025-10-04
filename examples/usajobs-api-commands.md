# USAJobs API Example Commands

This document provides a comprehensive list of example commands for searching different job types through the USAJobs API. These commands can be used with `curl` or in a browser.

## Healthcare Positions

### 1. Registered Nurses

```bash
# Registered Nurses in Denver
curl "http://localhost:3000/api/usajobs?query=registered%20nurse&location=Denver,%20CO&radius=25"

# Registered Nurses with specific salary range
curl "http://localhost:3000/api/usajobs?query=registered%20nurse&location=Denver,%20CO&radius=25&salaryMin=75000"

# Specialized Nursing (ICU)
curl "http://localhost:3000/api/usajobs?query=ICU%20nurse&location=Denver,%20CO&radius=50"
```

### 2. Physicians

```bash
# All Physician positions nationwide
curl "http://localhost:3000/api/usajobs?query=physician"

# Physicians in Washington DC area
curl "http://localhost:3000/api/usajobs?query=physician&location=Washington,%20DC&radius=25"

# Specialized Physicians (Pediatricians)
curl "http://localhost:3000/api/usajobs?query=pediatrician&location=United%20States"
```

### 3. Medical Technicians

```bash
# Medical Laboratory Technicians
curl "http://localhost:3000/api/usajobs?query=medical%20laboratory%20technician&location=Denver,%20CO&radius=50"

# Radiology Technicians
curl "http://localhost:3000/api/usajobs?query=radiology%20technician&location=United%20States"

# Pharmacy Technicians
curl "http://localhost:3000/api/usajobs?query=pharmacy%20technician&location=Boston,%20MA&radius=50"
```

### 4. Healthcare Administration

```bash
# Healthcare Administrators
curl "http://localhost:3000/api/usajobs?query=healthcare%20administrator&location=United%20States"

# Medical Records Specialists
curl "http://localhost:3000/api/usajobs?query=medical%20records&location=Denver,%20CO&radius=50"

# Hospital Management
curl "http://localhost:3000/api/usajobs?query=hospital%20management&location=Chicago,%20IL&radius=25"
```

### 5. Mental Health Professionals

```bash
# Psychologists
curl "http://localhost:3000/api/usajobs?query=psychologist&location=United%20States"

# Social Workers
curl "http://localhost:3000/api/usajobs?query=social%20worker&location=Denver,%20CO&radius=50"

# Substance Abuse Counselors
curl "http://localhost:3000/api/usajobs?query=substance%20abuse%20counselor&location=United%20States"
```

## Entry-Level Positions

### 1. General Entry-Level Searches

```bash
# Entry-Level Government Jobs
curl "http://localhost:3000/api/usajobs?query=entry%20level&location=United%20States"

# Recent Graduate Positions
curl "http://localhost:3000/api/usajobs?query=recent%20graduate&location=Denver,%20CO&radius=50"

# Student Trainee Positions
curl "http://localhost:3000/api/usajobs?query=student%20trainee&location=United%20States"
```

### 2. GS-5 and Below Positions (Typically Entry-Level)

```bash
# GS-5 Positions
curl "http://localhost:3000/api/usajobs?query=GS-5&location=Denver,%20CO&radius=50"

# GS-4 Positions
curl "http://localhost:3000/api/usajobs?query=GS-4&location=United%20States"

# GS-3 and Below
curl "http://localhost:3000/api/usajobs?query=GS-3&location=United%20States"
```

### 3. Administrative and Clerical Entry-Level

```bash
# Administrative Assistants
curl "http://localhost:3000/api/usajobs?query=administrative%20assistant&location=Denver,%20CO&radius=25"

# Office Clerks
curl "http://localhost:3000/api/usajobs?query=office%20clerk&location=United%20States"

# Data Entry Operators
curl "http://localhost:3000/api/usajobs?query=data%20entry&location=Denver,%20CO&radius=50"
```

### 4. Internships and Pathways Programs

```bash
# Federal Internships
curl "http://localhost:3000/api/usajobs?query=internship&location=United%20States"

# Pathways Programs
curl "http://localhost:3000/api/usajobs?query=pathways%20program&location=Denver,%20CO&radius=50"

# Student Volunteers
curl "http://localhost:3000/api/usajobs?query=student%20volunteer&location=United%20States"
```

### 5. Technical Entry-Level Positions

```bash
# IT Specialists (Entry-Level)
curl "http://localhost:3000/api/usajobs?query=IT%20specialist%20entry&location=Denver,%20CO&radius=50"

# Engineering Technicians
curl "http://localhost:3000/api/usajobs?query=engineering%20technician%20entry&location=United%20States"

# Laboratory Aides
curl "http://localhost:3000/api/usajobs?query=laboratory%20aide&location=Denver,%20CO&radius=50"
```

## Location-Specific Searches

### Major Cities

```bash
# All federal jobs in Denver
curl "http://localhost:3000/api/usajobs?location=Denver,%20CO&radius=25"

# All federal jobs in Washington DC
curl "http://localhost:3000/api/usajobs?location=Washington,%20DC&radius=25"

# All federal jobs in New York
curl "http://localhost:3000/api/usajobs?location=New%20York,%20NY&radius=25"
```

### Remote Work Options

```bash
# Remote jobs
curl "http://localhost:3000/api/usajobs?query=remote&location=United%20States"

# Telework eligible positions
curl "http://localhost:3000/api/usajobs?query=telework&location=United%20States"
```

## Advanced Filtering Examples

```bash
# Jobs with specific salary minimum
curl "http://localhost:3000/api/usajobs?query=healthcare&location=Denver,%20CO&salaryMin=75000"

# Limit results to 25
curl "http://localhost:3000/api/usajobs?query=software&location=Denver,%20CO&limit=25"

# Jobs posted in the last week (requires API implementation)
curl "http://localhost:3000/api/usajobs?query=healthcare&location=Denver,%20CO&postedSince=7"
```

These commands can be adapted for use in browser, JavaScript fetch calls, or other HTTP clients by using the same URL patterns.