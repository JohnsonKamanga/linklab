# LinkLab — Smart URL Shortener & Analytics Platform

**Project Type:** Full-stack web application  
**Category:** Developer Tools / Analytics / Productivity  
**Difficulty:** Beginner–Intermediate  
**Estimated Development Time:** 6–8 hours  
**Primary Learning Goal:** ASP.NET Core Web API development with C#

---

## 1. Project Overview

**LinkLab** is a modern URL shortening and link analytics platform that enables users to transform long, complicated URLs into short, shareable links while tracking their performance through an intuitive analytics dashboard.

Beyond simply shortening URLs, LinkLab provides insights into how links are being used, including total clicks, historical activity, and referral sources.

The application will feature a clean, responsive interface inspired by modern SaaS dashboards, prioritizing simplicity, usability, and fast interactions.

### The Problem

Long URLs can be inconvenient to share, especially when they contain complex paths, query parameters, or tracking information.

Traditional URL shorteners solve this by generating compact links, but users often lack an easy way to understand how those links perform.

LinkLab combines these two capabilities into one lightweight platform.

### The Solution

A web application where users can:

- Convert long URLs into short, memorable links.
- Copy and share generated links instantly.
- Generate QR codes for their shortened links.
- View all previously created links from a dashboard.
- Track clicks and analyze link performance.
- Discover which links receive the most engagement.

The initial version will not require account registration. It will operate as a single-user demonstration application to keep development manageable.

---

## 2. Core Functional Requirements

### 2.1 URL Shortening

The primary feature of LinkLab is the ability to generate short URLs from original web addresses.

**Expected behavior**

1. A user enters a valid URL, such as `https://example.com/articles/software-engineering/introduction-to-dotnet`.
2. The application validates the provided address.
3. The backend generates a unique alphanumeric short code.
4. The original URL and short code are stored in the database.
5. A shortened link is returned to the user.

**Example**

Original URL:
`https://example.com/articles/software-engineering/introduction-to-dotnet`

Generated URL:
`https://linklab.example/a7Bx92Q`

The domain above is illustrative; local development will use the application's configured localhost address.

**Rules**

- Only valid HTTP and HTTPS URLs are accepted.
- Short codes contain 7 randomly generated alphanumeric characters.
- Every short code must be unique.
- Invalid URLs should produce clear validation messages.
- Users may shorten the same original URL multiple times, generating separate links.

### 2.2 Link Redirection

When someone opens a shortened URL, the application must automatically redirect them to the original destination.

**Expected behavior**

1. A visitor opens a shortened link.
2. ASP.NET Core extracts the short code from the incoming request.
3. The application searches the database for the matching record.
4. If the record exists, the application records the click and redirects the visitor.
5. If no matching link exists, the application returns a 404 response.

For the MVP, use temporary HTTP redirects (302) rather than permanent redirects (301), because permanent redirects may be cached and prevent subsequent clicks from reaching the analytics backend.

### 2.3 Link Management Dashboard

Users should be able to view and manage their generated links from a centralized dashboard.

Each link should display:

- Original URL
- Shortened URL
- Creation date
- Total number of clicks
- Copy-to-clipboard action
- View analytics action
- Delete action

**Additional behavior**

- Links are sorted by creation date, with the newest appearing first.
- Original URLs are visually truncated if they are excessively long.
- Users receive visual feedback when copying shortened links.
- Deleting a link requires confirmation.
- Deleted links must no longer redirect visitors.

Because authentication is excluded from the initial version, this dashboard is intended for a single-user local environment, not a public multi-user service.

### 2.4 Link Analytics

LinkLab should automatically collect basic analytics whenever a shortened URL is visited.

**Metrics to capture**

| Metric | Description |
|---|---|
| Total clicks | Number of recorded visits to a short link |
| Click history | How many clicks occurred each day |
| Referrer | Domain from which a visitor accessed the link, when available |
| Last accessed | Timestamp of the most recent click |
| Most popular links | Links ranked by their total click counts |

The application should store individual click events in the database and use aggregation queries to calculate analytics.

Referrers may be missing because browsers, apps, and privacy settings do not always provide that information. Missing values should be categorized as *Direct / Unknown*.

For simplicity and privacy, the MVP does not need to store IP addresses, identify visitors, or perform geographical tracking.

### 2.5 Analytics Visualization

Each shortened link should have its own analytics page.

The page should contain:

**Summary Cards**
- Total Clicks
- Clicks Today
- Clicks in the Last 7 Days
- Last Accessed Date

**Clicks Over Time**

A line or area chart showing the number of clicks per day during the previous seven days.

**Traffic Sources**

A small table or horizontal bar chart showing the most common referring domains.

**Recent Activity**

A chronological list showing the latest recorded visits, including visit time and referrer.

The MVP only needs a seven-day historical view. Advanced date filtering can be implemented later.

### 2.6 QR Code Generation

Users should be able to generate QR codes for their shortened links.

**Expected behavior**

- A QR code is displayed in a modal when requested.
- The code encodes the shortened URL rather than the original address.
- Users can download the QR code as a PNG image.
- Users can scan the code to open the shortened link.

QR codes can be generated on the React frontend using a QR code library. The backend does not need to generate or store QR code images.

This is a lower-priority MVP feature if development time becomes limited.

---

## 3. Technical Architecture

### Frontend

**Technology:** React, TypeScript, Vite, Tailwind CSS

**Recommended libraries**

- TanStack Query — server-state management and caching
- React Router — frontend navigation
- Bklit UI (primary) & Recharts (secondary) — analytics charts
- Shadcn UI for reusable components
- Lucide React — iconography
- QR code library — QR generation

The frontend communicates with the backend through REST APIs.

### Backend

**Technology:** ASP.NET Core Web API with C#

**Architectural approach:** Controller-based API with a service layer.

The backend will handle:

- URL validation
- Short code generation
- Link persistence
- Redirect processing
- Click tracking
- Analytics calculations
- API error handling

**Backend architectural components**

- **Controllers:** Receive HTTP requests and return responses.
- **Services:** Encapsulate application business logic.
- **Models/Entities:** Represent persisted records.
- **DTOs:** Define API request and response structures.
- **DbContext:** Handles database interactions using Entity Framework Core.

The application should use constructor-based dependency injection to manage services and database dependencies.

### Database

**Technology:** SQLite + Entity Framework Core

SQLite is recommended because it requires no external database server and is ideal for completing the project quickly.

Use EF Core migrations to create and update the database schema.

---

## 4. Database Design

The MVP requires only two primary entities.

### Entity: Link

| Field | Type | Description |
|---|---|---|
| Id | Guid | Primary key |
| OriginalUrl | string | Destination URL |
| ShortCode | string | Unique shortened identifier |
| CreatedAt | DateTime | Creation timestamp (UTC) |
| LastAccessedAt | DateTime? | Most recent visit |

A unique database index should be created for `ShortCode`.

### Entity: ClickEvent

| Field | Type | Description |
|---|---|---|
| Id | Guid | Primary key |
| LinkId | Guid | Foreign key referencing Link |
| ClickedAt | DateTime | Click timestamp (UTC) |
| Referrer | string? | Source domain, if available |

### Relationships

- One Link can have many ClickEvents.
- Each ClickEvent belongs to one Link.
- Deleting a Link should also delete its associated click records.

Total clicks should be calculated from stored click events rather than maintaining a separate counter in the MVP.

---

## 5. REST API Specification

The backend should expose the following endpoints.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/links` | Create a shortened URL |
| GET | `/api/links` | Retrieve all links |
| GET | `/api/links/{id}` | Retrieve a specific link |
| DELETE | `/api/links/{id}` | Delete a link |
| GET | `/api/links/{id}/analytics` | Retrieve analytics |
| GET | `/{shortCode}` | Track a click and redirect |

### Example: Create Short Link

**Request**

`POST /api/links`

```json
{
  "originalUrl": "https://example.com/my-very-long-url"
}
```

**Response — 201 Created**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalUrl": "https://example.com/my-very-long-url",
  "shortCode": "a7Bx92Q",
  "shortUrl": "https://linklab.example/a7Bx92Q",
  "createdAt": "2026-11-05T12:00:00Z"
}
```

The response should use a configured public base URL instead of hardcoding the deployment domain.

### Example: Link Analytics

`GET /api/links/{id}/analytics`

**Response**

```json
{
  "totalClicks": 120,
  "clicksToday": 14,
  "clicksLast7Days": 76,
  "lastAccessedAt": "2026-11-05T14:30:00Z",
  "dailyClicks": [
    {
      "date": "2026-11-04",
      "count": 18
    },
    {
      "date": "2026-11-05",
      "count": 14
    }
  ],
  "topReferrers": [
    {
      "domain": "github.com",
      "count": 42
    },
    {
      "domain": "Direct / Unknown",
      "count": 31
    }
  ]
}
```

The example omits some dates for brevity. The actual seven-day response should include all seven dates, including days with zero clicks. Date-based metrics should use a consistent timezone, preferably UTC.

### API Error Handling

The application should return appropriate HTTP status codes:

- `400 Bad Request` — Invalid URL or malformed input
- `404 Not Found` — Link does not exist
- `409 Conflict` — Duplicate short code, if a collision cannot be resolved
- `500 Internal Server Error` — Unexpected server failure

Use ASP.NET Core's built-in validation and standardized Problem Details responses where appropriate.

---

## 6. User Interface & Experience

LinkLab should have a polished, minimalist SaaS aesthetic.

**Visual direction:** Modern developer tool with clean typography, restrained colors, subtle borders, generous spacing, and optional dark mode.

### Page 1: Dashboard

The main page displays:

- Application logo and navigation
- A prominent URL shortening form
- Summary statistics
- A list of previously shortened links
- Actions for copying, viewing, and deleting links

After successful shortening, the user should immediately see the generated link with a copy button.

### Page 2: Analytics Detail

Selecting a link opens its analytics page.

The page includes:

- Original URL and short URL
- Summary metric cards
- Seven-day click activity chart
- Top referral sources
- Recent click activity

Users should be able to return to the dashboard easily.

### Page 3: Not Found

An attractive error page should appear when someone visits an unknown short code, with an option to return to the main application.

### UX Requirements

- Responsive layouts for mobile and desktop
- Clear loading states
- Helpful validation messages
- Success and error notifications
- Empty states when no links or analytics exist
- Confirmation before destructive actions

---

## 7. Security & Reliability Considerations

Although LinkLab is primarily a learning project, it should follow basic secure-development practices.

**URL validation:** Restrict destinations to HTTP/HTTPS and reject malformed URLs or unsafe schemes such as `javascript:`.

**Short code generation:** Use cryptographically secure random generation and enforce uniqueness at the database level. Retry generation if a collision occurs.

**Error handling:** Avoid exposing internal exception details to API consumers.

**Data integrity:** Use EF Core's asynchronous database operations and appropriate relationships.

**Redirect safety:** Treat user-submitted destinations as untrusted. A public URL shortener can be abused to disguise malicious links, so a real deployment should add abuse prevention, rate limiting, and destination screening.

**Dashboard access:** The unauthenticated MVP should remain local or otherwise private. Before public deployment, implement authentication and protect link-management and analytics endpoints.

---

## Final Deliverable

A working, responsive URL shortening platform with persistent storage, redirect functionality, link management, and a basic analytics dashboard.

**Product tagline:** *Shorten smarter. Track everything that matters.*

The application should demonstrate the essential features of a real-world ASP.NET Core backend while remaining small enough to complete in a focused day of development.