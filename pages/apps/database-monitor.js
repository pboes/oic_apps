import Link from 'next/link';
import { useOICFramework, OICStyles } from '../../lib/oic-framework';
import { useState, useEffect } from 'react';

const APP_ID = 'database-monitor';

export default function DatabaseMonitorApp() {
  const { isConnected, events, generateQR, registerEventHandler, unregisterEventHandler } = useOICFramework();
  const [qrCode, setQrCode] = useState('');
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [monitoredEvents, setMonitoredEvents] = useState([]);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  // Set up event handler for monitoring activation
  useEffect(() => {
    const criteria = {
      recipient: '0xf48554937f18885c7f15c432c596b5843648231d',
      amount: '1000000000000000000', // 1 CRC in 18 decimals
      data: APP_ID,
    };

    const handleMonitorEvent = (eventData) => {
      console.log('Monitor activation event received:', eventData);
      setMonitoringActive(true);

      // Start monitoring for 60 seconds
      setTimeout(() => {
        setMonitoringActive(false);
        setMonitoredEvents([]);
      }, 60000);
    };

    registerEventHandler('database-monitor', criteria, handleMonitorEvent);

    return () => {
      unregisterEventHandler('database-monitor');
    };
  }, [registerEventHandler, unregisterEventHandler]);

  // Monitor all events when active
  useEffect(() => {
    if (monitoringActive) {
      setMonitoredEvents(events);
    }
  }, [events, monitoringActive]);

  const generateQRCode = async () => {
    try {
      const result = await generateQR(1, APP_ID);
      setQrCode(result.qrCode);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={OICStyles.container}>
      <div style={OICStyles.content}>
        <h2 style={OICStyles.h2}>Database Monitor</h2>

        <p>
          <Link href="/" style={OICStyles.link}>
            ← Back to home
          </Link>
        </p>

        <p>
          Pay 1 CRC to activate real-time database monitoring for 60 seconds.
          See all blockchain events as they happen!
        </p>

        <div style={{
          ...OICStyles.status,
          ...(isConnected ? OICStyles.statusConnected : OICStyles.statusDisconnected)
        }}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>

        {monitoringActive && (
          <div style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: '#f0f8f0',
            border: '2px solid #4CAF50',
            borderRadius: '5px'
          }}>
            <h3 style={{...OICStyles.h3, marginTop: 0, color: '#4CAF50'}}>
              🟢 Monitoring Active
            </h3>
            <p style={{margin: '5px 0', fontSize: '14px'}}>
              Watching for database events in real-time...
            </p>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          margin: '30px 0'
        }}>
          <button
            onClick={generateQRCode}
            style={{
              ...OICStyles.button,
              ...OICStyles.buttonPrimary,
              padding: '12px 24px',
              fontSize: '16px'
            }}
            disabled={monitoringActive}
          >
            {monitoringActive ? '📡 Monitoring Active...' : '💰 Pay 1 CRC to Monitor'}
          </button>
        </div>

        {qrCode && !monitoringActive && (
          <div style={OICStyles.qrContainer}>
            <h3 style={{...OICStyles.h3, marginTop: 0}}>
              Scan to Activate Monitoring
            </h3>
            <img
              src={qrCode}
              alt="Database Monitor QR Code"
              style={{maxWidth: '250px'}}
            />
            <p style={{margin: '10px 0', fontSize: '14px', color: '#666'}}>
              Cost: 1 CRC • Duration: 60 seconds • App ID: {APP_ID}
            </p>
          </div>
        )}

        <div style={{
          margin: '30px 0',
          minHeight: '200px'
        }}>
          <h3 style={OICStyles.h3}>
            Recent Events {monitoringActive ? '(Live)' : ''}
          </h3>

          {monitoredEvents.length === 0 ? (
            <p style={{fontStyle: 'italic', color: '#666'}}>
              {monitoringActive ? 'Waiting for events...' : 'No monitored events yet. Activate monitoring to see live data.'}
            </p>
          ) : (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '3px'
            }}>
              {monitoredEvents.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    borderBottom: index < monitoredEvents.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff'
                  }}
                >
                  <div style={{marginBottom: '5px'}}>
                    <strong>From:</strong> {event.sender || 'N/A'}
                  </div>
                  <div style={{marginBottom: '5px'}}>
                    <strong>To:</strong> {event.recipient || 'N/A'}
                  </div>
                  <div style={{marginBottom: '5px'}}>
                    <strong>Amount:</strong> {event.amount || '0'} wei
                  </div>
                  <div style={{marginBottom: '5px'}}>
                    <strong>Data:</strong> {event.data || 'None'}
                  </div>
                  <div style={{fontSize: '11px', color: '#666'}}>
                    <strong>Hash:</strong> {event.transactionHash || 'N/A'}<br/>
                    <strong>Time:</strong> {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={OICStyles.debug}>
          <strong>How it works:</strong>
          <ul style={{margin: '10px 0', paddingLeft: '20px'}}>
            <li>Pay 1 CRC to activate monitoring</li>
            <li>Watch live blockchain events for 60 seconds</li>
            <li>See transaction details including sender, recipient, amount, and data</li>
            <li>Perfect for debugging or understanding blockchain activity</li>
          </ul>

          <strong>Connection Status:</strong>
          <div style={{margin: '5px 0'}}>
            Socket: {isConnected ? 'Connected ✅' : 'Disconnected ❌'}<br/>
            Total Events Received: {events.length}<br/>
            Monitoring: {monitoringActive ? 'Active 🔴' : 'Inactive ⚪'}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          img {
            max-width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
