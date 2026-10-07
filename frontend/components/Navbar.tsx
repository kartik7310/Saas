"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  User,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Play
} from "lucide-react";
import { useAuth, getRoleRoute } from "@/lib/AuthContext";
import { useAuthModal } from "@/lib/AuthModalContext";
import NotificationBell from "./NotificationBell";
import { toast } from "sonner";
import RoleSwitchModal from "./RoleSwitchModal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Users } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  buyerOnly?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Compare", href: "/compare-properties" },
  { label: "Bank Partner", href: "/#bank-partners", buyerOnly: true },
  { label: "Book VC", href: "/book-vc", buyerOnly: true },
];

const YOUTUBE_URL = "https://youtube.com/@link2builder?si=0OhdEsLakmibnCTr";

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter links: non-admin users can see everything
  let filteredLinks = navLinks.filter(link => {
    const role = user?.role?.toUpperCase();
    if (user && (role === "ADMIN" || role === "SUPER_ADMIN" || role === "BUILDER")) {
      if (link.buyerOnly) return false;
    }
    return true;
  });

  if (user) {
    const role = user.role?.toUpperCase();
    if (role === "BUYER") {
      filteredLinks.push({ label: "Meetings", href: "/my-meetings" });
    } else {
      filteredLinks.push({ label: "Dashboard", href: getRoleRoute(user.role) });
    }
  }

  if (!mounted) return (
    <nav className="w-full h-16 bg-white border-b border-gray-100 fixed top-0 z-50" />
  );

  return (
    <nav
      className={`w-full z-50 h-16 md:h-20 flex items-center justify-between px-5 md:px-8 transition-all duration-300 fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-sm`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-2`}
      >
        <img
          src="/images/linktwobuilderlogo.jpeg"
          alt="Link2Builder"
          className="h-16 md:h-20 w-auto object-contain"
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${isActive
                ? "text-purple-600 border-b-2 border-purple-600 pb-0.5"
                : "text-gray-500 hover:text-purple-600"
                }`}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Watch Guide Video Icon */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-all group shadow-sm"
          title="Watch Guide"
        >
          <Play size={16} className="text-purple-600 fill-purple-600 ml-0.5 group-hover:scale-110 transition-transform" />
        </a>
      </div>

      {/* Desktop Right Icons */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {user.role?.toUpperCase() !== "SUPER_ADMIN" && user.role?.toUpperCase() !== "ADMIN" && (
              <Button
                variant="ghost"
                onClick={() => {
                  const role = user.role.toUpperCase();
                  if (role === "BUYER") {
                    setShowRoleModal(true);
                    return;
                  }
                  const path = role === "BUILDER" ? "/builder-dashboard/add-property" :
                    role === "SELLER" ? "/seller/add-property" :
                      role === "BROKER" ? "/broker/add-property" : "/seller/add-property";
                  router.push(path);
                }}
                className="hidden md:flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold px-4 rounded-full border border-purple-100 transition-all"
              >
                <Plus size={16} />
                Add Property
              </Button>
            )}
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 group cursor-pointer outline-none border-none focus:outline-none pr-1">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-purple-200"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all border-purple-200 text-purple-600 bg-purple-50 group-hover:border-purple-400 shadow-sm font-bold text-xs`}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className={`text-sm font-semibold text-gray-700 group-hover:text-purple-600`}>
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl shadow-2xl border-gray-100">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Signed in as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] font-medium text-purple-600 mt-0.5 lowercase">{user.role}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="focus:bg-purple-50 focus:text-purple-700 cursor-pointer rounded-lg px-3 py-2.5"
                  onClick={() => {
                    const role = user?.role?.toUpperCase();
                    const rolePrefix = (role === 'SUPER_ADMIN' || role === 'ADMIN') ? '/admin-dashboard' :
                      role === 'BUILDER' ? '/builder-dashboard' :
                        role === 'SELLER' ? '/seller' :
                          role === 'BROKER' ? '/broker' : '';

                    if (role === 'BUYER') {
                      router.push('/my-meetings');
                    } else {
                      router.push(`${rolePrefix}/meetings`);
                    }
                  }}
                >
                  My Meetings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {(user.role?.toUpperCase() === 'BUYER' ||
                    user.role?.toUpperCase() === 'SELLER' ||
                    user.role?.toUpperCase() === 'BROKER') && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg px-3 py-2 text-sm font-semibold focus:bg-purple-50 focus:text-purple-700 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>Switch Role</span>
                          </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-56 p-2 rounded-xl shadow-xl border-gray-100 bg-white">
                            {['BUYER', 'SELLER', 'BROKER']
                              .filter(r => r !== user.role?.toUpperCase())
                              .map(role => (
                                <DropdownMenuItem
                                  key={role}
                                  className="focus:bg-purple-50 focus:text-purple-700 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold"
                                  onClick={() => switchRole(role)}
                                >
                                  Switch to {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} Account
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-lg px-3 py-2.5 font-bold"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => openSignup(true)}
              className="hidden md:flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold px-4 rounded-full border border-purple-100 transition-all"
            >
              <Plus size={16} />
              Add Property
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => openLogin()}
                className="text-sm font-bold text-gray-600 hover:text-purple-600 rounded-full"
              >
                Log in
              </Button>
              <Button
                onClick={() => openSignup()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-full shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95"
              >
                Sign up
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className={`md:hidden text-gray-700`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-6 gap-5">
            {user && (
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                  {user.name?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{user.role}</div>
                </div>
              </div>
            )}

            {filteredLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="text-gray-700 font-semibold hover:text-purple-600 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 font-semibold hover:text-purple-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                <Play size={12} className="text-purple-600 fill-purple-600 ml-0.5" />
              </div>
              Watch Guide
            </a>

            {user && (['BUYER', 'SELLER', 'BROKER'].includes(user.role?.toUpperCase())) && (
              <div className="flex flex-col gap-2 pb-4 border-b border-gray-50">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2">Switch Role</div>
                <div className="flex flex-wrap gap-2">
                  {['BUYER', 'SELLER', 'BROKER']
                    .filter(r => r !== user.role?.toUpperCase())
                    .map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          switchRole(role);
                          setMenuOpen(false);
                        }}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100"
                      >
                        {role}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => {
                    openLogin();
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-center py-3 rounded-full font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    openSignup();
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-center bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700"
                >
                  Sign up
                </button>
              </div>
            )}

            {(!user || (user && ["BUILDER", "SELLER", "BROKER"].includes(user.role?.toUpperCase()))) && (
              <button
                onClick={() => {
                  if (!user) {
                    openSignup(true);
                  } else {
                    const role = user.role.toUpperCase();
                    if (role === "BUYER") {
                      setShowRoleModal(true);
                      setMenuOpen(false);
                      return;
                    }
                    const path = role === "BUILDER" ? "/builder-dashboard/add-property" :
                      role === "SELLER" ? "/seller/add-property" :
                        role === "BROKER" ? "/broker/add-property" : "/seller/add-property";
                    router.push(path);
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-purple-50 text-purple-600 py-3 rounded-full font-bold hover:bg-purple-100 transition-colors"
              >
                <Plus size={18} />
                Add Property
              </button>
            )}
          </div>
        </div>
      )}
      {/* Role Switch Modal */}
      <RoleSwitchModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Professional Account Required"
        description="To add a property, you must switch your role to Seller or Broker. You can do this from your profile menu."
        targetRoles={["SELLER", "BROKER"]}
      />
    </nav>
  );
}
