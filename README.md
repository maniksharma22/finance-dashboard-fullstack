# FinanceOS | Project Notes

# Overview
FinanceOS is a platform that helps teams track, manage, and analyze income and expenses safely. 
It has a React + Tailwind CSS frontend and a Java Spring Boot backend. 
Roles include ADMIN (full control), ANALYST (can analyze and view data), and VIEWER (read-only); frontend is on Render and MySQL on Clever Cloud.

# Features
- Role-based access control: ADMIN, ANALYST, VIEWER
- Active-Sync security: login and mid-session user checks
- Global search across Amounts, Categories, Descriptions, and Dates
- Visual feedback for empty search results ("No Matches Found")
- Expense Distribution charts (Pie/Doughnut)
- Cashflow Pulse chart showing 7-day financial activity
- Interactive UI

# Technical Stack
- Frontend: React + Vite for fast, single-page application behavior
- Styling: Tailwind CSS for premium look; Lucide React for consistent icons
- Backend: Java Spring Boot for scalable and secure API
- API Integration: fetch with useCallback and useMemo for smooth performance

# How to Run (Frontend)
1. npm install      # Install frontend dependencies
2. Set VITE_API_URL # In .env file pointing to Spring Boot backend
3. npm run dev      # Start the app

# How to Run Backend (Spring Boot)
1. Open terminal and go to backend folder (where pom.xml or build.gradle is)
2. Build the project:
   - If Maven: mvn clean install
   - If Gradle: ./gradlew build
3. Run the Spring Boot app:
   - Maven: mvn spring-boot:run
   - Gradle: ./gradlew bootRun
4. Ensure MySQL database is running and credentials in application.properties or .env are correct
5. Backend will run on default port 8080 (or as configured)
6. Frontend communicates with backend via REST API at VITE_API_URL

# Security Note
- Uses Basic Auth encoded in Base64 for each request
- Backend validates every request to ensure correct authorization
- Real-time checks log out users immediately if they are blocked or deactivated
