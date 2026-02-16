import { useEffect } from "react";

import { Refine, Authenticated, type NotificationProvider } from "@refinedev/core";
import { ThemedLayoutV2, AuthPage } from "@refinedev/mui";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import routerProvider from "@refinedev/react-router-v6";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { SnackbarProvider, useSnackbar, type OptionsObject } from "notistack";

import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";

import { ProfessionalsList } from "./pages/professionals/list";
import { ProfessionalCreate } from "./pages/professionals/create";
import { ProfessionalsBulk } from "./pages/professionals/bulk";

function NewtonxLogo() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 17"
            fill="none"
            aria-hidden="true"
            focusable="false"
            style={{ height: 28, width: "auto", display: "block" }}
        >
            <path
                d="M4.0671 0.973633H0L7.1906 8.83955L0 16.7104H4.0671L6.411 14.1232C7.4141 13.0208 7.9653 11.5807 7.9653 10.091V7.59312C7.9653 6.10337 7.4091 4.66327 6.411 3.56085L4.0671 0.973633Z"
                fill="currentColor"
            />
            <path
                d="M12.9659 16.7104H17.0329L9.8423 8.84452L17.0329 0.973633H12.9659L10.622 3.56085C9.6189 4.66327 9.0677 6.10337 9.0677 7.59312V10.091C9.0677 11.5807 9.6239 13.0208 10.622 14.1232L12.9659 16.7104Z"
                fill="currentColor"
            />
        </svg>
    );
}

function Layout() {
    return (
        <ThemedLayoutV2>
            <Outlet />
        </ThemedLayoutV2>
    );
}

function TitleManager() {
    const location = useLocation();

    useEffect(() => {
        document.title = "NewtonX: Professional Signup!";
    }, [location.pathname, location.search]);

    return null;
}

function RefineAppWithNotifications() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const notificationProvider: NotificationProvider = {
        open: ({ message, description, type, key }) => {
            const variant: OptionsObject["variant"] =
                type === "success" ? "success" : type === "error" ? "error" : "info";

            enqueueSnackbar(description ?? message, {
                key,
                variant,
                autoHideDuration: 4000,
            });
        },
        close: (key) => {
            closeSnackbar(key as any);
        },
    };

    return (
        <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            notificationProvider={notificationProvider}
            routerProvider={routerProvider}
            resources={[
                {
                    name: "professionals",
                    list: "/professionals",
                    create: "/professionals/new",
                    meta: { icon: <PeopleAltIcon /> },
                },
                {
                    name: "bulk",
                    list: "/professionals/bulk",
                    meta: { icon: <UploadFileIcon /> },
                },
            ]}
            options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                title: {
                    icon: <NewtonxLogo />,
                    text: "Professional Signup",
                },
                projectId: "professionals-prototype",
            }}
        >
            <Routes>
                <Route
                    path="/login"
                    element={
                        <AuthPage
                            type="login"
                            formProps={{
                                defaultValues: { email: "test@test.com", password: "test" },
                            }}
                        />
                    }
                />

                <Route
                    element={
                        <Authenticated key="app-auth" fallback={<Navigate to="/login" replace />}>
                            <Layout />
                        </Authenticated>
                    }
                >
                    <Route index element={<Navigate to="/professionals" replace />} />
                    <Route path="/professionals" element={<ProfessionalsList />} />
                    <Route path="/professionals/new" element={<ProfessionalCreate />} />
                    <Route path="/professionals/bulk" element={<ProfessionalsBulk />} />
                </Route>

                <Route path="*" element={<Navigate to="/professionals" replace />} />
            </Routes>
        </Refine>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <TitleManager />
            <CssBaseline />
            <GlobalStyles
                styles={{
                    html: { height: "100%" },
                    body: { height: "100%" },
                    "#root": { height: "100%" },
                }}
            />

            <SnackbarProvider maxSnack={3}>
                <RefineAppWithNotifications />
            </SnackbarProvider>
        </BrowserRouter>
    );
}
