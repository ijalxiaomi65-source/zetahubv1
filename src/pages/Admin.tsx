import React, { useState, useEffect } from "react";
import { Shield, Users, Crown, Trash2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    // In a real app, this would be an API call
    // For now, we'll use mock data + mockUsers from localStorage if we had a way to access it
    // But since mockUsers is server-side, we'll just show a list
    setUsers([
      { id: "1", name: "Zeta", email: "zeta@zeta.com", role: "OWNER", isVip: true },
      { id: "2", name: "User 1", email: "user1@example.com", role: "USER", isVip: false },
      { id: "3", name: "VIP User", email: "vip@example.com", role: "VIP", isVip: true },
    ]);
    setLoading(false);
  }, [navigate]);

  const toggleVip = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isVip: !u.isVip, role: !u.isVip ? "VIP" : "USER" } : u));
  };

  const deleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="pt-32 px-6 sm:px-12 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link to="/profile" className="flex items-center gap-2 text-primary font-bold hover:underline mb-4">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <Shield className="text-primary" size={40} /> ADMIN PANEL
          </h1>
          <p className="opacity-40 uppercase tracking-widest text-xs font-black">Manage ZetaHub Users & Content</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 text-center">
            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Total Users</p>
            <p className="text-2xl font-black">{users.length}</p>
          </div>
          <div className="glass-card px-6 py-4 text-center border-primary/20">
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">VIP Active</p>
            <p className="text-2xl font-black text-primary">{users.filter(u => u.isVip).length}</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-40">User</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-40">Role</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-40">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs opacity-40">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border ${
                    user.role === 'OWNER' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    user.role === 'VIP' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-white/10 text-white/40 border-white/10'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    {user.isVip ? (
                      <><CheckCircle size={16} className="text-green-500" /> <span className="text-sm font-bold text-green-500">VIP</span></>
                    ) : (
                      <><XCircle size={16} className="text-white/20" /> <span className="text-sm font-bold opacity-20">Standard</span></>
                    )}
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {user.role !== 'OWNER' && (
                      <>
                        <button 
                          onClick={() => toggleVip(user.id)}
                          className={`p-2 rounded-lg border transition-all ${user.isVip ? 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'}`}
                          title={user.isVip ? "Remove VIP" : "Make VIP"}
                        >
                          <Crown size={18} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
