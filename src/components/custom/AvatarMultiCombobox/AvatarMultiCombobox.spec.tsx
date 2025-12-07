import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor
} from '~/test/testing-utils';
import { AvatarMultiCombobox, Item } from './AvatarMultiCombobox';

describe('AvatarMultiCombobox', () => {
  const users: Item[] = [
    {
      value: '1',
      label: 'Sy, Bernalino',
      photo: undefined
    },
    {
      value: '2',
      label: 'Kaur, Gurjot',
      photo: undefined
    },
    {
      value: '3',
      label: 'Kaur, Kawaljeet',
      photo: undefined
    },
    {
      value: '4',
      label: 'Prajapati, Anal',
      photo:
        'https://cynergydevsa.blob.core.windows.net/mobilek/human-resources/user-management/user-images/10400.jpeg'
    },
    {
      value: '5',
      label: 'Chourio, Jorge2',
      photo:
        'https://cynergydevsa.blob.core.windows.net/mobilek/human-resource/user-management/user-images/ddb8742f-b9f0-406e-a5e0-b21d1252cc07.jpg'
    },
    {
      value: '6',
      label: 'Chourio, Jorge7',
      photo:
        'https://cynergydevsa.blob.core.windows.net/mobilek/human-resources/user-management/user-images/0.jpeg'
    }
  ];

  it('should render', () => {
    const { container, getByTestId } = renderComponent({ users });

    expect(container).toBeDefined();
    expect(getByTestId('avatarcombobox')).toBeInTheDocument();
  });

  it('should show the initial list of items', async () => {
    const user = userEvent.setup();
    const { getAllByTestId } = renderComponent({ options: users });

    user.click(screen.getByRole('combobox'));

    await waitFor(() =>
      expect(getAllByTestId(/unselected-list-item-.*/)).toHaveLength(
        users.length
      )
    );
  });

  it('should trigger handle select function when clicking a nonSelected item', async () => {
    const mockOnSelect = vi.fn();
    const { getByTestId, getAllByTestId } = renderComponent({
      options: users,
      onSelect: mockOnSelect
    });

    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() =>
      expect(getAllByTestId(/unselected-list-item-.*/)).toHaveLength(
        users.length
      )
    );

    fireEvent.click(getByTestId('unselected-list-item-0'));

    await waitFor(() =>
      expect(mockOnSelect).toHaveBeenCalledWith(users[0].value)
    );
  });

  it('should not show more images/avatars than the provided max provided', async () => {
    const selectedUsers = ['1', '2', '3'];
    const maxImages = 1;

    const { getAllByTestId } = renderComponent({
      options: users,
      value: selectedUsers,
      maxImages: 1
    });

    await waitFor(() =>
      expect(getAllByTestId(/parentdiv.*/)).toHaveLength(maxImages + 1)
    );
  });

  it('should not show unselected list when readonly', async () => {
    const { queryByTestId } = renderComponent({
      options: users,
      readOnly: true
    });

    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() =>
      expect(queryByTestId('unselected-list')).not.toBeInTheDocument()
    );
  });
});

function renderComponent(props = {}) {
  return render(
    <AvatarMultiCombobox
      value={[]}
      onSelect={async (_: string) => {}}
      {...props}
    />
  );
}
