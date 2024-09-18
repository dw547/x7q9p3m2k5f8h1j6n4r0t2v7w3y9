import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import CardData from '../components/CardData';

const Dashboard = () => {
  const location = useLocation();
  const selectedServer = location.state?.selectedServer;
  const [serverFilter, setServerFilter] = useState('All Servers');

  useEffect(() => {
    if (selectedServer) {
      setServerFilter(selectedServer.server_name);
    }
  }, [selectedServer]);

  return (
    <Container>
      <div>
        <CardData selectedServer={selectedServer} serverFilter={serverFilter} />
      </div>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

export default Dashboard;