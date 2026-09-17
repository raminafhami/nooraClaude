import { Metadata } from "next";

import { CourseClient } from "./_module/CourseClient";

const metadata: Metadata = {
	title: "Course Details",
};

function CoursePage({ params: { id } }: { params: { id: string } }) {
	return <CourseClient id={id} />;
}

export { metadata };
export default CoursePage;
