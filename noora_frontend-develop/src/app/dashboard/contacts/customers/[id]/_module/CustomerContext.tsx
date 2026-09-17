"use client";

import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

import { User } from "@/identity/users/models/User";
import { omitUndefinedProperties } from "@/utils/object/omitUndefinedProperties";

type CustomerContextType = {
	customer: User;
	updateCustomer: (data: Partial<User>) => void;
};

const CustomerContext = createContext<CustomerContextType>(
	{} as CustomerContextType,
);

function CustomerProvider({
	children,
	initialValue,
}: PropsWithChildren<{ initialValue: User }>) {
	const [customer, setCustomer] = useState<User>(initialValue);

	const updateCustomer = useCallback((data: Partial<User>) => {
		setCustomer((customer) => ({
			...customer,
			...omitUndefinedProperties(data),
		}));
	}, []);

	const ctxValue = useMemo<CustomerContextType>(
		() => ({
			customer,
			updateCustomer,
		}),
		[customer, updateCustomer],
	);

	return (
		<CustomerContext.Provider value={ctxValue}>
			{children}
		</CustomerContext.Provider>
	);
}

function useCustomerContext(): CustomerContextType {
	return useContext(CustomerContext);
}

export type { CustomerContextType };
export { CustomerContext, CustomerProvider, useCustomerContext };
