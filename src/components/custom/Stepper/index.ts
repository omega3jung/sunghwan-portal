import { Stepper as Root } from "./Stepper";
import { StepperConnector } from "./StepperConnector";
import { StepperItem } from "./StepperItem";
import { StepperLabel } from "./StepperLabel";
import { StepperTrigger } from "./StepperTrigger";

export const Stepper = Object.assign(Root, {
  Item: StepperItem,
  Trigger: StepperTrigger,
  Label: StepperLabel,
  Connector: StepperConnector,
});
