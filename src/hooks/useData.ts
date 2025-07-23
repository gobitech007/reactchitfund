import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { 
  fetchChitList, 
  createChit, 
  updateChit, 
  deleteChit 
} from '../redux/slices/dataSlice';
import { ChitListItem } from '../utils/interface-utils';

export const useData = () => {
  const dispatch = useAppDispatch();
  const { chitList, loading, error } = useAppSelector(state => state.data);

  const getChitList = () => {
    dispatch(fetchChitList());
  };

  const addChit = (chitData: Partial<ChitListItem>) => {
    return dispatch(createChit(chitData));
  };

  const editChit = (id: string, data: Partial<ChitListItem>) => {
    return dispatch(updateChit({ id, data }));
  };

  const removeChit = (id: string) => {
    return dispatch(deleteChit(id));
  };

  return {
    chitList,
    loading,
    error,
    getChitList,
    addChit,
    editChit,
    removeChit
  };
};

export default useData;