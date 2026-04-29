import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { adminApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Users, Package, ShoppingBag, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Trash2, Ban, UserCheck, UserCog,
  BarChart3, ShieldAlert, Flag, MessageCircle, RefreshCw,
} from "lucide-react";

const TABS = ["Overview", "Users", "Listings", "Orders", "Payments", "Fraud", "Carts"];

function Badge({ label, color }) {
  const m = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${m[color] || m.gray}`}>{label}</span>;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "-"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{children}</th>;
}
function Td({ children, cls = "" }) {
  return <td className={`px-4 py-3 text-sm ${cls}`}>{children}</td>;
}
function sc(s) {
  const m = { active: "green", pending: "yellow", sold: "blue", rejected: "red", cancelled: "gray", completed: "green", held: "yellow", released: "green", refunded: "red", banned: "red" };
  return m[s] || "gray";
}
function Table({ heads, children, empty }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
          <tr>{heads.map(h => <Th key={h}>{h}</Th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-gray-400 text-sm">{empty}</p>}
    </div>
  );
}

export default function AdminDashboardPage({ theme, setTheme }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fraud, setFraud] = useState(null);
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [adminForm, setAdminForm] = useState({ open: false, fullName: "", email: "", password: "" });

  useEffect(() => { if (user && user.role !== "admin") navigate("/", { replace: true }); }, [user, navigate]);
  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true); setErr("");
    try {
      if (tab === "Overview") { const r = await adminApi.getStats(); setStats(r.data); }
      else if (tab === "Users") { const r = await adminApi.getUsers({ limit: 100 }); setUsers(r.data || []); }
      else if (tab === "Listings") { const r = await adminApi.getListings({ limit: 100 }); setListings(r.data || []); }
      else if (tab === "Orders") { const r = await adminApi.getOrders({ limit: 100 }); setOrders(r.data || []); }
      else if (tab === "Payments") { const r = await adminApi.getPayments({ limit: 100 }); setPayments(r.data || []); }
      else if (tab === "Fraud") { const r = await adminApi.getFraudAlerts(); setFraud(r.data); }
      else if (tab === "Carts") { const r = await adminApi.getAllCarts(); setCarts(r.data || []); }
    } catch (e) { setErr(e.message || "Failed to load"); }
    setLoading(false);
  }

  async function act(key, fn) {
    setBusy(p => ({ ...p, [key]: true }));
    try { await fn(); await load(); }
    catch (e) { alert(e.message || "Action failed"); }
    setBusy(p => ({ ...p, [key]: false }));
  }

  const filtered = (arr) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter(x => JSON.stringify(x).toLowerCase().includes(q));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader theme={theme} setTheme={setTheme} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== "Overview" && tab !== "Fraud" && (
          <div className="mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}...`}
              className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
          </div>
        )}

        {err && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertTriangle className="size-4 shrink-0" /> {err}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && stats && (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={Users} label="Total Users" value={stats.users?.total} sub={`+${stats.users?.thisMonth ?? 0} this month`} color="bg-indigo-500" />
                  <StatCard icon={Package} label="Listings" value={stats.listings?.total} sub={`${stats.listings?.active ?? 0} active · ${stats.listings?.pending ?? 0} pending`} color="bg-green-500" />
                  <StatCard icon={ShoppingBag} label="Orders" value={stats.orders?.total} sub={`${stats.orders?.thisMonth ?? 0} this month`} color="bg-yellow-500" />
                  <StatCard icon={DollarSign} label="Revenue (ETB)" value={stats.payments?.revenue?.toLocaleString()} sub={stats.payments?.revenueGrowth ? `${stats.payments.revenueGrowth}% vs last month` : null} color="bg-emerald-500" />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <StatCard icon={Users} label="Buyers" value={stats.users?.buyers} color="bg-blue-400" />
                  <StatCard icon={ShoppingBag} label="Sellers" value={stats.users?.sellers} color="bg-purple-500" />
                  <StatCard icon={ShieldAlert} label="Banned Users" value={stats.users?.banned} color="bg-red-500" />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <StatCard icon={DollarSign} label="Payments in Escrow" value={stats.payments?.held} sub="Held payments awaiting release" color="bg-orange-500" />
                  <StatCard icon={CheckCircle} label="Email Verified Users" value={stats.users?.verified} color="bg-teal-500" />
                </div>
              </>
            )}

            {/* ── USERS ── */}
            {tab === "Users" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                  <button onClick={() => setAdminForm(f => ({ ...f, open: !f.open }))}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    <UserCog className="size-4" /> {adminForm.open ? "Cancel" : "Create New Admin"}
                  </button>
                  {adminForm.open && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <input placeholder="Full Name" value={adminForm.fullName}
                        onChange={e => setAdminForm(f => ({ ...f, fullName: e.target.value }))}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                      <input placeholder="Email" type="email" value={adminForm.email}
                        onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                      <input placeholder="Password" type="password" value={adminForm.password}
                        onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                      <button disabled={busy["create-admin"]}
                        onClick={() => act("create-admin", () => adminApi.createAdmin({ fullName: adminForm.fullName, email: adminForm.email, password: adminForm.password }).then(() => setAdminForm({ open: false, fullName: "", email: "", password: "" })))}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                        {busy["create-admin"] ? "Creating..." : "Create Admin"}
                      </button>
                    </div>
                  )}
                </div>

                <Table heads={["Name", "Email", "Role", "Status", "Verified", "Joined", "Actions"]} empty={filtered(users).length === 0 ? "No users found" : null}>
                  {filtered(users).map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <Td cls="font-medium text-gray-900 dark:text-white">{u.fullName}</Td>
                      <Td cls="text-gray-500 dark:text-gray-400">{u.email}</Td>
                      <Td><Badge label={u.role} color={u.role === "admin" ? "purple" : u.role === "seller" ? "blue" : "gray"} /></Td>
                      <Td><Badge label={u.isActive ? "Active" : "Banned"} color={u.isActive ? "green" : "red"} /></Td>
                      <Td cls="text-center">{u.isEmailVerified ? "✅" : "❌"}</Td>
                      <Td cls="text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {u.role !== "admin" && (
                            u.isActive
                              ? <button disabled={busy[`ban-${u._id}`]}
                                onClick={() => { const r = window.prompt("Ban reason (optional):"); act(`ban-${u._id}`, () => adminApi.banUser(u._id, r)); }}
                                className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400">
                                <Ban className="size-3" /> Ban
                              </button>
                              : <button disabled={busy[`unban-${u._id}`]}
                                onClick={() => act(`unban-${u._id}`, () => adminApi.unbanUser(u._id))}
                                className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400">
                                <UserCheck className="size-3" /> Unban
                              </button>
                          )}
                          {u.role !== "admin" && (
                            <button disabled={busy[`promote-${u._id}`]}
                              onClick={() => { if (window.confirm(`Promote ${u.fullName} to admin?`)) act(`promote-${u._id}`, () => adminApi.promoteToAdmin(u._id)); }}
                              className="flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-100 disabled:opacity-50 dark:bg-purple-900/20 dark:text-purple-400">
                              <UserCog className="size-3" /> Promote
                            </button>
                          )}
                          <select value={u.role}
                            onChange={e => act(`role-${u._id}`, () => adminApi.changeUserRole(u._id, e.target.value))}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => navigate(`/chat?userId=${u._id}`)}
                            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400">
                            <MessageCircle className="size-3" /> Chat
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
              </div>
            )}

            {/* ── LISTINGS ── */}
            {tab === "Listings" && (
              <Table heads={["Title", "Seller", "Category", "Price", "Status", "Created", "Actions"]} empty={filtered(listings).length === 0 ? "No listings found" : null}>
                {filtered(listings).map(l => (
                  <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <Td cls="font-medium text-gray-900 dark:text-white max-w-[180px] truncate">{l.title}</Td>
                    <Td cls="text-gray-500 dark:text-gray-400">{l.seller?.fullName || l.seller}</Td>
                    <Td cls="text-gray-500 dark:text-gray-400">{l.category}</Td>
                    <Td cls="font-medium text-gray-900 dark:text-white">ETB {l.price?.toLocaleString()}</Td>
                    <Td><Badge label={l.status} color={sc(l.status)} /></Td>
                    <Td cls="text-gray-400 text-xs">{new Date(l.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {l.status === "pending" && (
                          <>
                            <button disabled={busy[`approve-${l._id}`]}
                              onClick={() => act(`approve-${l._id}`, () => adminApi.approveListing(l._id))}
                              className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="size-3" /> Approve
                            </button>
                            <button disabled={busy[`reject-${l._id}`]}
                              onClick={() => act(`reject-${l._id}`, () => adminApi.rejectListing(l._id))}
                              className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-100 disabled:opacity-50 dark:bg-yellow-900/20 dark:text-yellow-400">
                              <XCircle className="size-3" /> Reject
                            </button>
                          </>
                        )}
                        <button disabled={busy[`del-${l._id}`]}
                          onClick={() => { if (window.confirm("Delete this listing?")) act(`del-${l._id}`, () => adminApi.deleteListing(l._id)); }}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400">
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}

            {/* ── ORDERS ── */}
            {tab === "Orders" && (
              <Table heads={["Order ID", "Buyer", "Seller", "Amount", "Status", "Date", "Actions"]} empty={filtered(orders).length === 0 ? "No orders found" : null}>
                {filtered(orders).map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <Td cls="font-mono text-xs text-gray-500 dark:text-gray-400">{o._id?.slice(-8)}</Td>
                    <Td cls="text-gray-900 dark:text-white">{o.buyer?.fullName || o.buyer}</Td>
                    <Td cls="text-gray-500 dark:text-gray-400">{o.seller?.fullName || o.seller}</Td>
                    <Td cls="font-medium text-gray-900 dark:text-white">ETB {o.totalAmount?.toLocaleString()}</Td>
                    <Td><Badge label={o.status} color={sc(o.status)} /></Td>
                    <Td cls="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {["pending", "processing", "shipped", "delivered", "cancelled", "completed"].map(s => s !== o.status && (
                          <button key={s} disabled={busy[`order-${o._id}-${s}`]}
                            onClick={() => { if (window.confirm(`Force status to "${s}"?`)) act(`order-${o._id}-${s}`, () => adminApi.forceOrderStatus(o._id, s, "Admin override")); }}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            → {s}
                          </button>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}

            {/* ── PAYMENTS ── */}
            {tab === "Payments" && (
              <Table heads={["Payment ID", "Buyer", "Seller", "Amount", "Status", "Flagged", "Date", "Actions"]} empty={filtered(payments).length === 0 ? "No payments found" : null}>
                {filtered(payments).map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <Td cls="font-mono text-xs text-gray-500 dark:text-gray-400">{p._id?.slice(-8)}</Td>
                    <Td cls="text-gray-900 dark:text-white">{p.buyer?.fullName || p.buyer}</Td>
                    <Td cls="text-gray-500 dark:text-gray-400">{p.seller?.fullName || p.seller}</Td>
                    <Td cls="font-medium text-gray-900 dark:text-white">ETB {p.amount?.toLocaleString()}</Td>
                    <Td><Badge label={p.status} color={sc(p.status)} /></Td>
                    <Td cls="text-center">{p.isFlagged ? <Flag className="size-4 text-red-500 inline" /> : "—"}</Td>
                    <Td cls="text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {p.status === "held" && (
                          <>
                            <button disabled={busy[`release-${p._id}`]}
                              onClick={() => act(`release-${p._id}`, () => adminApi.releasePayment(p._id, "Admin release"))}
                              className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="size-3" /> Release
                            </button>
                            <button disabled={busy[`refund-${p._id}`]}
                              onClick={() => { const r = window.prompt("Refund reason:"); if (r) act(`refund-${p._id}`, () => adminApi.refundPayment(p._id, r)); }}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400">
                              <XCircle className="size-3" /> Refund
                            </button>
                          </>
                        )}
                        {p.isFlagged
                          ? <button disabled={busy[`unflag-${p._id}`]}
                            onClick={() => act(`unflag-${p._id}`, () => adminApi.unflagPayment(p._id))}
                            className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300">
                            <Flag className="size-3" /> Unflag
                          </button>
                          : <button disabled={busy[`flag-${p._id}`]}
                            onClick={() => { const r = window.prompt("Flag reason:"); if (r) act(`flag-${p._id}`, () => adminApi.flagPayment(p._id, r)); }}
                            className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-100 disabled:opacity-50 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Flag className="size-3" /> Flag
                          </button>
                        }
                      </div>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}

            {/* ── FRAUD ── */}
            {tab === "Fraud" && (
              <div className="space-y-6">
                {!fraud ? (
                  <p className="text-center text-gray-400 py-10">No fraud data available.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <StatCard icon={ShieldAlert} label="Flagged Payments" value={fraud.flaggedPayments} color="bg-red-500" />
                      <StatCard icon={AlertTriangle} label="Suspicious Users" value={fraud.suspiciousUsers} color="bg-yellow-500" />
                      <StatCard icon={Flag} label="Reported Listings" value={fraud.reportedListings} color="bg-orange-500" />
                    </div>
                    {fraud.alerts && fraud.alerts.length > 0 && (
                      <Table heads={["Type", "Description", "User", "Date"]} empty={null}>
                        {fraud.alerts.map((a, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <Td><Badge label={a.type} color="red" /></Td>
                            <Td cls="text-gray-700 dark:text-gray-300">{a.description}</Td>
                            <Td cls="text-gray-500 dark:text-gray-400">{a.user?.fullName || a.user || "—"}</Td>
                            <Td cls="text-gray-400 text-xs">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</Td>
                          </tr>
                        ))}
                      </Table>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── CARTS ── */}
            {tab === "Carts" && (
              <Table heads={["User", "Items", "Total Value", "Last Updated"]} empty={filtered(carts).length === 0 ? "No carts found" : null}>
                {filtered(carts).map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <Td cls="font-medium text-gray-900 dark:text-white">{c.user?.fullName || c.user}</Td>
                    <Td cls="text-gray-500 dark:text-gray-400">{c.items?.length ?? 0} item(s)</Td>
                    <Td cls="font-medium text-gray-900 dark:text-white">
                      ETB {(c.items?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0) || 0).toLocaleString()}
                    </Td>
                    <Td cls="text-gray-400 text-xs">{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </Table>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
