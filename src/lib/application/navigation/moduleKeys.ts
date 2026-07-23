export const programModuleKeys = {
  devMenu: {
    base: "devMenu",
    privilegeMenu: {
      based: "permission.basedRenderingMenu",
      guest: "permission.guestPrivilegeMenu",
      user: "permission.userPrivilegeMenu",
      leader: "permission.leaderPrivilegeMenu",
      manager: "permission.managerPrivilegeMenu",
      admin: "permission.adminPrivilegeMenu",
    },
    componentsDemo: {
      based: "componentsDemo",
      timeline: "componentsDemo.timeline",
      stepper: "componentsDemo.stepper",
      multiCombobox: "componentsDemo.multiCombobox",
      dateRangePicker: "componentsDemo.dateRangePicker",
      avatarMultiComboBox: "componentsDemo.avatarMultiComboBox",
    },
  },

  portal: "portal",
  home: "home",
  documents: "documents",

  settings: {
    base: "settings",
  },

  serviceDesk: {
    base: "serviceDesk",
    tickets: "serviceDesk.tickets",
    insights: "serviceDesk.insights",
  },
} as const;
