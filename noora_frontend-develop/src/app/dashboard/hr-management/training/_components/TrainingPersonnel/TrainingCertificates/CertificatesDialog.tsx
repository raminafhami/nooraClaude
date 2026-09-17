"use client";

import { useContext, useEffect } from "react";

import { ModalContext } from "@/ui/Modal";

import { CertificateForm } from "./CertificateForm";
import { CertificatesContext } from "./CertificatesContext";
import { CertificatesTable } from "./CertificatesTable";

export function CertificatesDialog() {
	const { personnel } = useContext(CertificatesContext);
	const { dispatch } = useContext(ModalContext);

	useEffect(() => {
		if (personnel) {
			dispatch({
				type: "UPDATE",
				title: `گواهی های آموزشی ${personnel.fullname}`,
			});
		}
	}, [personnel, dispatch]);

	if (!personnel) {
		return <></>;
	}

	return (
		<div className="grid grid-cols-12 gap-x-10">
			<CertificateForm />
			<CertificatesTable />
		</div>
	);
}
