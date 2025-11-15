import { useSnackbar } from 'notistack';

const useCustomSnackbar = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showSnackbar = (message, type = 'default') => {
    enqueueSnackbar(message, {
      variant: type, // 'default' | 'error' | 'success' | 'warning' | 'info'
      style: {
        fontFamily: 'IRANSans',
        direction: 'rtl',
      },
    });
  };

  return { showSnackbar };
};

export default useCustomSnackbar;