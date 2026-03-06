import { Layout } from '@/components/layout/Layout';
import { Header } from '@/components/layout/Header';

export const JobsPage = () => {
  return (
    <Layout>
      <Header />
      <div className="p-8">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Jobs Dashboard</h2>
          <p className="text-gray-600">
            Welcome to the Job Scanner! This is the React version of the application.
          </p>
          <p className="text-gray-600 mt-2">
            Components are being migrated from vanilla JS. Stay tuned!
          </p>
        </div>
      </div>
    </Layout>
  );
};
