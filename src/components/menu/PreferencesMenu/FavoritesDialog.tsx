import { Loader2, Plus, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Combobox } from '~/components/ui/combobox';
import {
  useFetchFavorites,
  useFetchShortcuts,
  useUpdateShortcuts
} from '~/hooks/useFetchShortcuts';
import { ValueLabel } from '~/types/common';
import CustomDialog from '../CustomDialog';

type Props = {
  user: any;
  onClosing?: (isOpen: boolean) => void;
};

export const FavoritesDialog = (props: Props) => {
  const maximum = 10;

  const { user, onClosing } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  const { data: availableFavourites } = useFetchShortcuts({
    locationId: user?.location?.value,
    serviceId: user?.service?.value,
    employeeId: user?.userid,
    all: 1
  });

  const { data: items } = useFetchFavorites({
    locationId: user?.location?.value,
    serviceId: user?.service?.value,
    employeeId: user?.userid,
    all: 0
  });

  const userFavourites = useMemo(() => items?.[0]?.children ?? [], [items]);

  // update favorites.
  const { mutate: updateFavorites, isLoading: isUpdating } =
    useUpdateShortcuts();

  const onClosingPopup = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!!onClosing) {
      onClosing(isOpen);
    }
  };

  const options = useMemo(() => {
    if (!availableFavourites || !userFavourites) {
      return;
    }

    const favorites = userFavourites.map((item) => item.pgm_menuitem);

    return availableFavourites?.reduce((col, current) => {
      if (!favorites?.includes(current.pgm_menuitem)) {
        col.push({
          value: current.pgm_menuitem,
          label: current.pgm_name
        });
      }

      return col;
    }, [] as ValueLabel[]);
  }, [availableFavourites, userFavourites]);

  // adding selected favorite to favorites.
  const addFavorites = () => {
    if (!selectedItem) {
      return;
    }

    const currentFavorites =
      userFavourites.map((item) => {
        return item.pgm_menuitem;
      }) ?? [];

    editFavorites([...currentFavorites, selectedItem]);
  };

  // remove selected favorite from favorites.
  const removeFavorites = (itemkey: string) => {
    const filteredList = userFavourites.reduce((col, item) => {
      if (item.pgm_menuitem !== itemkey) {
        col.push(item.pgm_menuitem);
      }

      return col;
    }, [] as string[]);

    editFavorites(filteredList);
  };

  const editFavorites = async (data: string[]) => {
    if (!user?.userid) {
      return;
    }

    const favorites = data.join(',');

    updateFavorites({
      employeeId: user.userid,
      shortcuts: favorites
    });

    setSelectedItem('');
  };

  // DOM.
  return (
    <CustomDialog
      className="gap-2 pb-6 sm:max-w-[480px]"
      title="Manage Favorites"
      isOpen={open}
      trigger={
        <Button variant="outline" className="h-10 w-full p-2">
          <Star size="16" className="mr-2 text-primary" />
          Manage Favorites
        </Button>
      }
      triggerAsChild={true}
      onOpenChange={onClosingPopup}
    >
      <p className="text-left text-[10px]">
        Select up to {maximum - (userFavourites?.[0]?.children?.length || 0)}{' '}
        aditional frequent Links
      </p>
      <div className="flex items-center gap-2">
        <Combobox
          value={selectedItem}
          placeholder="Select menu"
          options={options}
          onChange={(e) => setSelectedItem(e)}
        />

        <Button
          className="w-20 gap-1 p-2"
          onClick={addFavorites}
          disabled={isUpdating || !selectedItem}
        >
          {!isUpdating ? (
            <Plus className="mr-2 text-white" />
          ) : (
            <Loader2 className="animate-spin text-white" size="16" />
          )}
          Add
        </Button>
      </div>

      <p className="text-left text-sm">Current Favorites</p>
      <div className="grid grid-cols-2">
        {userFavourites.map((row) => (
          <Button
            key={row.pgm_menuitem}
            className="w-full justify-start gap-1 p-1 text-sm font-normal"
            variant="ghost"
            disabled={isUpdating || userFavourites?.length >= maximum}
            onClick={() => removeFavorites(row.pgm_menuitem)}
          >
            {!isUpdating ? (
              <X className="text-primary" />
            ) : (
              <Loader2 className="animate-spin text-primary" />
            )}

            {row.pgm_name}
          </Button>
        ))}
      </div>
    </CustomDialog>
  );
};
