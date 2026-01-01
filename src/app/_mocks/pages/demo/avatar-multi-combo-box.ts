import { ImageValueLabel } from "@/types";
import { withBasePath } from "@/utils";

export const avatarComboMock: ImageValueLabel[] = [
  // Korean
  {
    value: "minsookim@sunghwan-portal.dev",
    label: "김 민수",
    image: withBasePath("/_mocks/avatar/male-04.png"),
  },
  {
    value: "seoyeonlee@sunghwan-portal.dev",
    label: "이 서연",
    image: withBasePath("/_mocks/avatar/female-04.png"),
  },

  // English
  {
    value: "johnmiller@sunghwan-portal.dev",
    label: "John Miller",
    image: withBasePath("/_mocks/avatar/male-01.png"),
  },
  {
    value: "emilyjohnson@sunghwan-portal.dev",
    label: "Emily Johnson",
    image: withBasePath("/_mocks/avatar/female-01.png"),
  },

  // Spanish
  {
    value: "carlosgarcia@sunghwan-portal.dev",
    label: "Carlos García",
    image: withBasePath("/_mocks/avatar/male-02.png"),
  },
  {
    value: "anarodriguez@sunghwan-portal.dev",
    label: "Ana Rodríguez",
    image: withBasePath("/_mocks/avatar/female-02.png"),
  },

  // French
  {
    value: "jeandupont@sunghwan-portal.dev",
    label: "Jean Dupont",
    image: withBasePath("/_mocks/avatar/male-03.png"),
  },
  {
    value: "clairemoreau@sunghwan-portal.dev",
    label: "Claire Moreau",
    image: withBasePath("/_mocks/avatar/female-03.png"),
  },
];
