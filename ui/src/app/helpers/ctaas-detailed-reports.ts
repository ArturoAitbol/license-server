export const ConfirmDialogConst = Object.freeze({
    title: 'Confirm Action',
    message: 'All tests are needed?',
    confirmCaption: 'Yes',
    cancelCaption: 'No, Only Failed',
});

export const EndpointColumnsConst = [
    { name: 'Vendor', dataKey: 'vendor', position: 'left', isSortable: true },
    { name: 'Model', dataKey: 'model', position: 'center', isSortable: true },
    { name: 'DID', dataKey: 'did', position: 'center', isSortable: true },
    { name: 'Firmware', dataKey: 'firmwareVersion', position: 'center', isSortable: true },
    { name: 'Service Provider', dataKey: 'serviceProvider', position: 'center', isSortable: true },
    { name: 'Domain', dataKey: 'domain', position: 'center', isSortable: true },
    { name: 'Region', dataKey: 'region', position: 'center', isSortable: false }
];

export const SummaryColumnsConst = [
    { header: 'Test Cases Executed', value: 'total' },
    { header: 'Passed', value: 'passed' },
    { header: 'Failed', value: 'failed' },
    { header: 'Start Time', value: 'summaryStartTime' },
    { header: 'End Time', value: 'summaryEndTime' }
];

export const TestFeatureandCallReliability = [
    { header: 'Start Date', value: 'startTime' },
    { header: 'End Date', value: 'endTime' },
    { header: 'Status', value: 'status' },
    { header: 'Call Type', value: 'callType' },
    { header: 'Error Category', value: 'errorCategory' },
    { header: 'Reason', value: 'errorReason' },
    { header: 'From Jitter (ms)', value: 'fromJitter' },
    { header: 'To Jitter (ms)', value: 'toJitter' },
    { header: 'From Round trip time (ms)', value: 'fromRoundTrip' },
    { header: 'To Round trip time (ms)', value: 'toRoundTrip' },
    { header: 'From Packet Loss (%)', value: 'fromPacketLoss' },
    { header: 'To Packet Loss (%)', value: 'toPacketLoss' },
    { header: 'From Bitrate (kbps)', value: 'fromAvgBitrate' },
    { header: 'To Bitrate (kbps)', value: 'toAvgBitrate' },
];

export const StatsColumnsConst = [
    { header: 'Sent packets', value: 'Sent packets' },
    { header: 'Received codec', value: 'Received codec' },
    { header: 'Sent bitrate', value: 'Sent bitrate' },
    { header: 'Received packet loss', value: 'Received packet loss' },
    { header: 'Received Jitter', value: 'Received Jitter' },
    { header: 'Sent codec', value: 'Sent codec' },
    { header: 'Round trip time', value: 'Round trip time' },
    { header: 'Received packets', value: 'Received packets' },
    { header: 'POLQA', value: 'POLQA'}
];

export const DetailReportColumns = [
    { name: 'Test Case', dataKey: 'testCaseName', color:'color'},
    { name: 'Start Date', dataKey: 'startTime', color:'color'},
    { name: 'From', dataKey: 'fromDID', color:'color'},
    { name: 'From POLQA', dataKey: 'fromPOLQA', color:'color'},
    { name: 'To', dataKey: 'toDID', color:'color'},
    { name: 'To POLQA', dataKey: 'toPOLQA', color:'color'},
    { name: 'Status', dataKey: 'status', color:'color'},
    { name: 'Call Type', dataKey: 'callType', color:'color'}
];