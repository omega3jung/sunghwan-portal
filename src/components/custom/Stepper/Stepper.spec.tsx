import { faker } from '@faker-js/faker';
import { fireEvent, render, within } from '~/test/testing-utils';
import { Stepper } from './Stepper';

type Step = {
  label: string;
};

describe('Stepper', () => {
  let steps: Step[] = [];

  beforeAll(() => {
    steps = Array.from({ length: faker.number.int({ min: 3, max: 10 }) }).map(
      (_) => ({
        label: faker.lorem.slug()
      })
    );
  });

  it('should render', () => {
    const { container, getByTestId } = renderComponent({ steps });

    expect(container).toBeDefined();
    expect(getByTestId('stepper')).toBeInTheDocument();
  });

  it('should render the correct number of steps', () => {
    const { getAllByTestId } = renderComponent({ steps });

    expect(getAllByTestId(/stepper-button-.*/)).toHaveLength(steps.length);
  });

  it('should mark as selected the steps lower than the current step', () => {
    const currentStep = Math.floor(steps.length / 2);
    const { getAllByTestId } = renderComponent({
      steps,
      currentStep
    });

    const stepButtons = getAllByTestId(/stepper-button-.*/);

    for (let i = 0; i < currentStep; i++) {
      const check = within(stepButtons[i]).queryByTitle('check');

      expect(check).toBeInTheDocument();
    }

    for (let i = currentStep; i < steps.length; i++) {
      const check = within(stepButtons[i]).queryByTitle('check');

      expect(check).not.toBeInTheDocument();
    }
  });

  it('should not show check on square variant', () => {
    const currentStep = Math.floor(steps.length / 2);
    const variant = 'square';
    const { getAllByTestId } = renderComponent({
      steps,
      currentStep,
      variant
    });

    const stepButtons = getAllByTestId(/stepper-button-.*/);

    for (let i = currentStep; i < steps.length; i++) {
      const check = within(stepButtons[i]).queryByTitle('check');

      expect(check).not.toBeInTheDocument();
    }
  });

  it('should not render if there are no steps', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('stepper')).toBeEmptyDOMElement();
  });

  it('should call setStep with the correct index', () => {
    const mockSetStep = vi.fn();
    const { getByTestId } = renderComponent({
      steps,
      setStep: mockSetStep,
      currentStep: 1
    });

    fireEvent.click(getByTestId(`stepper-button-${steps.length - 1}`));

    expect(mockSetStep).toHaveBeenCalledWith(steps.length - 1);
  });

  it('should not call setStep if the step is disabled', () => {
    const mockSetStep = vi.fn();
    const { getByTestId } = renderComponent({
      steps: steps.map((_, index) => ({
        label: faker.lorem.slug(),
        disabled: index === 0
      })),
      setStep: mockSetStep,
      currentStep: 1
    });

    fireEvent.click(getByTestId('stepper-button-0'));

    expect(mockSetStep).not.toHaveBeenCalled();
  });
});

function renderComponent(props = {}) {
  return render(
    <Stepper
      setStep={(_: number) => {}}
      currentStep={0}
      variant="circle"
      steps={[]}
      {...props}
    />
  );
}
