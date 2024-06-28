
export default function Lobby() {
  return <></>;
}

export const getServerSideProps = async () => {
  const response = await fetch("https://api.huddle01.com/api/v1/create-room", {
    method: "POST",
    body: JSON.stringify({
      title: "MyCrumbs Call",
    }),
    headers: {
      "Content-type": "application/json",
      "x-api-key": "g6m5QybWE0XTq4drXk6k4rHxdCbIedsx" || "",
    },
  });

  const data = await response.json();

  const {roomId} = data.data;

  return {
    redirect: {
      destination: `/meet/${roomId}`,
      permanent: false,
    },
  };
};


