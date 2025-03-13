"use client";
import withAuth from "@/hoc/withAuth";

function CheckIn() {
  return <h1>Receptionist Check-In Panel</h1>;
}

export default withAuth(CheckIn, ["receptionist"]);
