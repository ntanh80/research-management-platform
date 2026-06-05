import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { queryClient } from '@/store/queryClient';
import { useUiStore } from '@/store/uiStore';

function App() {
  const currentTheme = useUiStore((s) => s.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm:
            currentTheme === 'dark'
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
        }}
      >
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
