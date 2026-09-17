"use client";

import "../../modules/map/index";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BsChatSquareText } from "react-icons/bs";
import { z } from "zod";

import AddNewTicket from "@/app/dashboard/tickets-list/_components/modal/AddNewTicket";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { DocumentsView } from "@/felo/files/components/documents-view/DocumentsView";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { Ids } from "../../data";
import InspectionTabs from "../../modules/InspectionTabs";
import { parseDevice } from "../../modules/map/DeviceDetector";
import { schema } from "../InspectorSelection/PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();
	const latitudeRef = useRef<number | undefined>();
	const longitudeRef = useRef<number | undefined>();
	const { formState, register, resetField, setValue, trigger, watch } =
		useFormContext<FormData>();

	const fields = watch();

	const {
		task: { data, userId, instanceId },
		hooks,
		dispatch,
	} = useTaskContext();

	const [isModal, setIsModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [clientDevice, setClientDevice] = useState<any>(undefined);
	const [tabIndex, setTabIndex] = useState<number>(0);
	const [latitude, setLatitude] = useState<number>(0);
	const [longitude, setLongitude] = useState<number>(0);

	useEffect(() => {
		dispatch({ type: "update", options: { submitBtn: false } });
		dispatch({
			type: "footer",
			children: (
				<div>
					{tabIndex < 2 && (
						<button
							type="button"
							onClick={() => setTabIndex(tabIndex + 1)}
							className="btn float-left mx-2 flex cursor-pointer select-none items-center rounded-xl bg-blue-500 px-3 py-2 text-white hover:bg-blue-700"
						>
							Next / بعدی
						</button>
					)}
					{tabIndex !== 0 && (
						<button
							type="button"
							onClick={() => setTabIndex(tabIndex - 1)}
							className="btn float-left mx-2 flex cursor-pointer select-none items-center rounded-xl bg-blue-500 px-3 py-2 text-white hover:bg-blue-700"
						>
							Prev / قبلی
						</button>
					)}
				</div>
			),
		});
	}, [dispatch, tabIndex]);

	useEffect(() => {
		const askForLocationPermission = async () => {
			try {
				const status = await navigator.permissions.query({
					name: "geolocation",
				});

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(() => null, null);
				} else {
					console.error("Geolocation is not supported by this browser.");
				}

				if (status.state === "granted") {
					const watchId = navigator.geolocation.watchPosition(
						({ coords }) => {
							const { latitude, longitude } = coords;
							// Check if the location has changed
							if (
								latitude !== latitudeRef.current ||
								longitude !== longitudeRef.current
							) {
								// Update the reference values
								latitudeRef.current = latitude;
								longitudeRef.current = longitude;
								// Location has changed, do something
								setLongitude(longitude);
								setLatitude(latitude);
								setValue("Latitude", latitude.toString());
								setValue("Longitude", longitude.toString());
							}
						},
						(error) => {
							console.error("Error getting location:", error);
							// toast.error("موقعیت مکانی یافت نشد!");
						},
					);

					return () => {
						navigator.geolocation.clearWatch(watchId);
					};
				} else {
					console.error("Location access not granted");
					// toast.error("موقعیت مکانی خود را فعال کنید!");

					// Handle the case where the user denies location access
				}
			} catch (error) {
				console.error("Error checking location permission:", error);
				// toast.error("موقعیت مکانی یافت نشد!");
				// Handle errors, such as a browser that does not support the Permissions API
			}
		};

		// Create refs to hold the previous latitude and longitude values

		askForLocationPermission();
	});

	useEffect(() => {
		const userAgent = navigator.userAgent;
		const deviceType = parseDevice(userAgent);
		deviceType.then((res) => {
			setClientDevice(res);
		});
	}, []);

	return (
		<>
			{data[Ids.inspectionInstanceId] && (
				<DocumentsView
					title="مدارک فایل بازرسی"
					instanceId={data[Ids.inspectionInstanceId]}
					folders={["docs"]}
				/>
			)}

			{isModal && (
				<AddNewTicket
					key={"addTicket"}
					isShow={isModal}
					setShow={setIsModal}
					isExternal
					caseNumber={fields[Ids.inspectionCaseNo]}
					refType="instance-inspection"
					userId={fields[Ids.inspectionExpert]}
					tabType="inspection"
					isTab={setTabIndex}
				/>
			)}
			<button
				type="button"
				onClick={() => setIsModal(true)}
				className="btn float-left flex cursor-pointer select-none items-center rounded-md bg-blue-500 p-3 text-white hover:bg-blue-700"
			>
				<>
					<BsChatSquareText size={20} className="ml-1" /> پشتیبانی
				</>
			</button>
			{/* <div className="mx-4 my-4">
        <FiInfo className="text-blue-500 inline ml-2" />
        <span>
          جهت تشخیص درست موقعیت شما <span className="text-red-700">VPN</span> و
          یا ابزارهای تغییر <span className="text-red-700">IP</span> خود را
          خاموش کنید.
        </span>
      </div> */}

			<div className="col-span-9 col-start-1 items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1 px-5">
				<InspectionTabs
					setTabIndex={setTabIndex}
					tabIndex={tabIndex}
					setValue={setValue}
					fields={fields}
					clientDevice={clientDevice}
					instanceId={instanceId}
					latitude={latitude}
					loading={loading}
					longitude={longitude}
					setLoading={setLoading}
					data={data}
				/>
			</div>
		</>
	);
}
