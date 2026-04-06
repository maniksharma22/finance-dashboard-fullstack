# FinanceOS | Project Notes

# Overview
FinanceOS is a platform designed to help teams efficiently track, manage, and analyze income and expenses while ensuring data security. 
It features a React + Tailwind CSS frontend deployed on Vercel, a Java Spring Boot backend hosted on Render, and a MySQL database on Clever Cloud. 
The system supports role-based access with ADMIN (full control), ANALYST (can analyze and view data), and VIEWER (read-only), ensuring that only ADMIN can perform any data modifications.

# Features
- Role-based access control: ADMIN, ANALYST, VIEWER
- Active-Sync security: login checks ensure users cannot access the system if their account has been deactivated by an ADMIN
- Global search across Amounts, Categories, Descriptions, and Dates
- Visual feedback for empty search results ("No Matches Found")
- Real-time data updates: any income or expense added or modified is reflected instantly in charts and analytics
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
- Users cannot log in if an ADMIN has deactivated their account
