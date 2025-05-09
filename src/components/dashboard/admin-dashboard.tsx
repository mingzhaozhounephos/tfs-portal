import { JSX, useState } from "react";
import { SideMenu } from "@/components/side-menu/side-menu";

const videoData = [
  {
    title: "Workplace Harassment Prevention",
    tag: "office",
    description: "Understand what constitutes workplace harassment and how to prevent it. This video covers company policies, reporting procedures, and creating a respectful...",
    image: "/rick-astley.jpg",
    date: "Dec 8, 2023",
    duration: "28:15",
    assigned: 35,
    completed: "95%",
  },
  {
    title: "Data Security Best Practices",
    tag: "office",
    description: "Protect sensitive company and customer data with these security best practices. Learn about password management, phishing prevention, and secure data...",
    image: "/rick-astley.jpg",
    date: "Nov 12, 2023",
    duration: "22:30",
    assigned: 30,
    completed: "85%",
  },
  {
    title: "Office Safety Procedures",
    tag: "office",
    description: "Learn essential safety procedures for the office environment. This video covers ergonomics, fire safety, and emergency protocols to ensure a safe workplace.",
    image: "/rick-astley.jpg",
    date: "Oct 5, 2023",
    duration: "16:45",
    assigned: 25,
    completed: "90%",
  },
];

const userData = [
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    role: "driver",
    joined: "Joined May 2023",
    assigned: 3,
    completed: "33%",
  },
  {
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    role: "driver",
    joined: "Joined Apr 2023",
    assigned: 4,
    completed: "25%",
  },
  {
    name: "Michael Chen",
    email: "driver@driver",
    role: "driver",
    joined: "Joined Mar 2023",
    assigned: 5,
    completed: "80%",
  },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<"videos" | "users">("videos");

  // For navigation, you can use state or router as needed
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex bg-[#f6fbf9] min-h-screen">
      <SideMenu role="admin" active={active} onNavigate={setActive} />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-600">
            Welcome, Administrator (admin@admin)
          </div>
        </div>
        {/* Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Widget title="Total Videos" value="9" sub="+2 videos added this week" icon="bell" />
          <Widget title="Total Users" value="6" sub="+3 users added this month" icon="users" />
          <Widget title="Completion Rate" value="0%" sub="" icon="activity" />
          <Widget title="Videos Watched" value="0" sub="+0 videos watched this week" icon="play" />
        </div>
        {/* Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${tab === "videos" ? "bg-black text-white" : "bg-white border"}`}
            onClick={() => setTab("videos")}
          >
            Recent Videos
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === "users" ? "bg-black text-white" : "bg-white border"}`}
            onClick={() => setTab("users")}
          >
            Recent Users
          </button>
        </div>
        {/* Content */}
        {tab === "videos" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videoData.map((video, i) => (
              <VideoCard key={i} {...video} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userData.map((user, i) => (
              <UserCard key={i} {...user} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Widget component
function Widget({ title, value, sub, icon }: { title: string; value: string; sub: string; icon: string }) {
  const icons: Record<string, JSX.Element> = {
    bell: <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />,
    users: <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />,
    activity: <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />,
    play: <span className="inline-block w-5 h-5 bg-gray-200 rounded-full" />,
  };
  return (
    <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 min-h-[100px]">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{title}</div>
        {icons[icon]}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

// VideoCard component
function VideoCard(props: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
      <div className="font-bold">{props.title}</div>
      <span className="inline-block text-xs bg-purple-100 text-purple-700 rounded px-2 py-0.5 mb-1">{props.tag}</span>
      <div className="text-xs text-gray-600 mb-2">{props.description}</div>
      <div className="relative aspect-video rounded overflow-hidden mb-2">
        <img src={props.image} alt={props.title} className="object-cover w-full h-full" />
        <button className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white/80 rounded-full p-2">
            <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><polygon points="13,11 23,16 13,21" fill="#fff"/></svg>
          </span>
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{props.date}</span>
        <span>{props.duration}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{props.assigned} assigned</span>
        <span>{props.completed} completed</span>
      </div>
      <button className="mt-2 w-full border rounded py-1 text-sm font-medium">Assign to Users</button>
    </div>
  );
}

// UserCard component
function UserCard(props: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="font-bold">{props.name}</div>
          <div className="text-xs text-gray-500">{props.email}</div>
        </div>
      </div>
      <span className="inline-block text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{props.role}</span>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{props.joined}</span>
        <span>{props.assigned} videos assigned</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{props.completed} completed</span>
      </div>
      <button className="mt-2 w-full border rounded py-1 text-sm font-medium">View Details</button>
    </div>
  );
}