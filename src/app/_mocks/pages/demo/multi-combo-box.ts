import {
  MultiComboBoxItem,
  TreeMultiComboBoxOption,
} from "@/components/custom/MultiComboBox";

export const comboBoxVariantData = ["default", "ghost"];
export const buttonVariantData = [
  "default",
  "secondary",
  "overdue",
  "destructive",
  "outline",
  "palette",
];

export const multiComboBoxMocks: MultiComboBoxItem[] = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" },
  { value: "January", label: "January" },
];
export const treeMultiComboBoxMocks: TreeMultiComboBoxOption[] = [
  {
    value: "fruit",
    label: "Fruit",
    children: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "grape", label: "Grape" },
      { value: "orange", label: "Orange" },
      { value: "peach", label: "Peach" },
    ],
  },
  {
    value: "vegetable",
    label: "Vegetable",
    children: [
      { value: "carrot", label: "Carrot" },
      { value: "onion", label: "Onion" },
      { value: "garlic", label: "Garlic" },
      {
        value: "broccoli",
        label: "Broccoli",
        disabled: true, // ✅ child disabled test
      },
    ],
  },
  {
    value: "meat",
    label: "Meat",
    children: [
      { value: "beef", label: "Beef" },
      { value: "pork", label: "Pork" },
      { value: "chicken", label: "Chicken" },
    ],
  },
  {
    value: "fish",
    label: "Fish",
    children: [
      { value: "salmon", label: "Salmon" },
      { value: "tuna", label: "Tuna" },
    ],
  },
  {
    value: "dairy",
    label: "Dairy",
    disabled: true, // ✅ parent disabled test
    children: [
      { value: "milk", label: "Milk" },
      { value: "cheese", label: "Cheese" },
    ],
  },
  {
    value: "empty",
    label: "Empty Category",
    children: [], // ✅ no children case
  },
];
