import type { Locale } from "@/lib/i18n/types";

export const userMenuLocales: Record<Locale, Record<string, string>> = {
  en: {
    myProfile: "My Profile",
    myActivities: "My Activities",
    notifications: "Notifications",
    logOut: "Log Out",
    impersonation: "Impersonation",
    stopImpersonation: "Stop Impersonation",
    startImpersonation: "Start Impersonation",
    asAdmin: "As admin",
    asManager: "As manager",
    asUser: "As user",
    asGuest: "As guest",
  },

  es: {
    myProfile: "Mi Perfil",
    myActivities: "Mis Actividades",
    notifications: "Notificaciones",
    logOut: "Cerrar Sesión",
    impersonation: "Impersonación",
    stopImpersonation: "Detener Impersonación",
    startImpersonation: "Iniciar Impersonación",
    asAdmin: "Como administrador",
    asManager: "Como manager",
    asUser: "Como usuario",
    asGuest: "Como invitado",
  },

  fr: {
    myProfile: "Mon Profil",
    myActivities: "Mes Activités",
    notifications: "Notifications",
    logOut: "Déconnexion",
    impersonation: "Impersonation",
    stopImpersonation: "Arrêter l'Impersonation",
    startImpersonation: "Démarrer l'Impersonation",
    asAdmin: "En tant qu'administrateur",
    asManager: "En tant que manager",
    asUser: "En tant qu'utilisateur",
    asGuest: "En tant qu'invité",
  },

  ko: {
    myProfile: "내 프로필",
    myActivities: "내 활동",
    notifications: "알림",
    logOut: "로그아웃",
    impersonation: "가장 인터페이스",
    stopImpersonation: "가장 인터페이스 종료",
    startImpersonation: "가장 인터페이스 시작",
    asAdmin: "시스템 관리자",
    asManager: "관리자",
    asUser: "사용자",
    asGuest: "게스트",
  },
};
