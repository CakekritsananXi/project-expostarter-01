import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './components/auth/AuthProvider';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Strategy from './pages/Strategy';
import Calendar from './pages/Calendar';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Collaboration from './pages/Collaboration';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import MobileLanding from './pages/MobileLanding';
import SubscriptionManager from './pages/SubscriptionManager';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* Public routes */}
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/landing" component={Landing} />
          <Route path="/mobile" component={MobileLanding} />

          {/* Protected routes */}
          <Route path="/success">
            <ProtectedRoute>
              <Layout>
                <Success />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/admin">
            <ProtectedRoute>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/ideation">
            <ProtectedRoute>
              <Layout>
                <Ideation />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/strategy">
            <ProtectedRoute>
              <Layout>
                <Strategy />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/calendar">
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/library">
            <ProtectedRoute>
              <Layout>
                <Library />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/analytics">
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/collaboration">
            <ProtectedRoute>
              <Layout>
                <Collaboration />
              </Layout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscription">
            <ProtectedRoute>
              <Layout>
                <SubscriptionManager />
              </Layout>
            </ProtectedRoute>
          </Route>

          {/* Default route - Dashboard */}
          <Route path="/">
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;