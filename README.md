# Mlimi Connect Farm - Agricultural Consultancy Platform

A comprehensive digital platform connecting farmers with agricultural consultants, providing farm management tools, advisory services, and sustainability insights for Malawi's agricultural community.

## 🌾 Project Overview

**Mlimi Connect Farm** is a full-stack web application built to empower farmers and agricultural consultants with modern digital tools for:

- **Farm Management**: Create detailed farm profiles with crop tracking and task scheduling
- **Agricultural Consultancy**: Connect farmers with certified consultants for expert advice
- **Weather Integration**: Real-time weather data for farming decisions
- **Training Resources**: Access to agricultural best practices and educational materials
- **Admin Dashboard**: Platform management and user oversight

## 🚀 Features

### 👤 User Management
- **Multi-role Authentication**: Farmers, Consultants, and Administrators
- **Secure Registration**: Email-based signup with role selection
- **Profile Management**: User profiles with location and specialization data

### 🌱 Farm Management
- **Comprehensive Farm Profiles**: Name, size, location, soil type, crops
- **Crop Tracking**: Multiple crop varieties with seasonal planning
- **Task Scheduling**: Interactive calendar for farming activities
- **Photo Documentation**: Image upload for farm records
- **Weather Integration**: Location-based weather forecasts

### 👨‍🌾 Consultancy System
- **Expert Matching**: Connect farmers with agricultural specialists
- **Consultation Requests**: Submit issues for expert review
- **Real-time Communication**: Live updates on consultation status
- **Recommendation Tracking**: Store and access expert advice

### 📊 Admin Dashboard
- **User Management**: View and manage all platform users
- **Platform Analytics**: User statistics and activity monitoring
- **Content Management**: Oversee training materials and resources

### 🎓 Training & Resources
- **Educational Content**: Access farming best practices
- **Resource Library**: Downloadable guides and materials
- **Interactive Learning**: Structured training modules

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching and state management
- **Lucide Icons** - Beautiful icon library

### Backend & Database
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - File storage
  - Row Level Security (RLS)

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **Vite Dev Server** - Hot module replacement
- **npm/yarn** - Package management

## 📁 Project Structure

```
mlimi-connect-farm-main/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   └── ui/                      # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── pages/                       # Application pages
│   │   ├── Index.tsx               # Landing page
│   │   ├── Login.tsx               # User authentication
│   │   ├── Register.tsx            # User registration
│   │   ├── Dashboard.tsx           # Farmer dashboard
│   │   ├── AddFarm.tsx             # Farm creation page
│   │   ├── Consultant.tsx          # Consultant dashboard
│   │   ├── Admin.tsx               # Admin dashboard
│   │   ├── Training.tsx            # Training resources
│   │   ├── Downloads.tsx           # Downloadable resources
│   │   └── NotFound.tsx            # 404 page
│   ├── integrations/
│   │   └── supabase/               # Supabase configuration
│   │       ├── client.ts
│   │       └── types.ts
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility functions
│   └── App.tsx                     # Main application component
├── supabase/                       # Supabase configuration
│   └── config.toml
├── database_setup.sql              # Database schema setup
├── farm_storage_setup.sql          # Storage bucket configuration
└── README.md
```

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profile information linked to Supabase auth:
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,              -- References auth.users(id)
  name TEXT,                        -- Full name
  email TEXT,                       -- Email address
  phone TEXT,                       -- Phone number
  role TEXT DEFAULT 'farmer',       -- User role (farmer/consultant/admin)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `farms`
Farm management data:
```sql
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id TEXT,                   -- References profiles(id)
  farm_name TEXT NOT NULL,          -- Farm name
  size DECIMAL,                     -- Size in hectares
  crops TEXT[],                     -- Array of crop names
  soil_type TEXT,                   -- Soil classification
  location TEXT,                    -- Location description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `consultations`
Consultancy request system:
```sql
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id TEXT,                   -- References profiles(id)
  consultant_id TEXT,               -- References profiles(id)
  issue_description TEXT NOT NULL,  -- Problem description
  recommendation TEXT,              -- Expert recommendation
  status TEXT DEFAULT 'pending',    -- Status (pending/active/closed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Policies

The application uses **Row Level Security (RLS)** to ensure data privacy:

- **Users can only view/edit their own profiles**
- **Farmers can only access their own farms**
- **Consultants can view assigned consultations**
- **Admins have elevated access to all data**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mlimi-connect-farm-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   VITE_WEATHER_API_KEY=your-weather-api-key
   ```

4. **Database Setup**
   Run the database setup scripts in your Supabase SQL Editor:
   ```bash
   # Run ultimate_reset.sql first to clean the database
   # Then run farm_storage_setup.sql for image uploads
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:8081](http://localhost:8081) in your browser

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Copy the project URL and anon key to `.env`
3. Run the database setup SQL scripts
4. Configure authentication providers if needed

### Weather API
1. Sign up for a free API key at [WeatherAPI.com](https://www.weatherapi.com)
2. Add the key to your `.env` file

## 📱 Usage Guide

### For Farmers
1. **Register** as a farmer with your details
2. **Add Farms** with comprehensive information
3. **Schedule Tasks** using the calendar interface
4. **Request Consultations** for farming challenges
5. **Access Training** materials and resources

### For Consultants
1. **Register** as a consultant with your specialization
2. **View Assigned Consultations** from farmers
3. **Provide Recommendations** and expert advice
4. **Track Consultation Progress** in real-time

### For Administrators
1. **Access Admin Dashboard** (admin role required)
2. **Manage Users** across the platform
3. **Monitor Platform Activity** and statistics
4. **Oversee Content** and training materials

## 🔍 Key Features Deep Dive

### Farm Creation System
The Add Farm page (`/farm/new`) provides:
- **Basic Information**: Name, size, location, soil type
- **Crop Management**: Select from predefined crop options
- **Task Scheduling**: Interactive calendar with task types
- **Image Upload**: Photo documentation (requires storage setup)
- **Data Validation**: Comprehensive form validation

### Real-time Features
- **Live Consultation Updates**: Real-time status changes
- **Weather Data**: Automatic location-based forecasts
- **Activity Feeds**: Recent farm activities tracking

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Experience**: Full-featured desktop interface

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify Supabase credentials in `.env`
- Check database schema matches the setup scripts
- Ensure RLS policies are correctly configured

**User Registration Issues**
- Run `ultimate_reset.sql` to clean database state
- Check Supabase authentication settings
- Verify trigger functions are active

**Image Upload Failures**
- Run `farm_storage_setup.sql` for storage bucket
- Check storage bucket permissions
- Verify file size limits

**Admin Dashboard Access**
- Ensure user has `role = 'admin'` in profiles table
- Check authentication state
- Verify admin route protection

### Debug Mode
Enable detailed logging by opening browser DevTools and checking:
- Console logs for API errors
- Network tab for failed requests
- Application state in React DevTools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Malawi Agricultural Community** for inspiration and requirements
- **Supabase Team** for the excellent backend platform
- **shadcn/ui** for beautiful component library
- **React Ecosystem** for powerful development tools

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for Malawi's farming community**
