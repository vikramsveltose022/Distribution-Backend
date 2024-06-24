<Scheduler>
    <input>
        <label>Start Date</label>
        <type type="date"></type>
        <name>Start_Date</name>
        <data type="date">mm/dd/yyyy</data>
    </input>

    <input>
        <label>Start Time</label>
        <type type="time"></type>
        <name>Start_Time</name>
        <data type="time"></data>
    </input>

    <Recurrence >
        <Heading>Recurrence Pattern</Heading>

        <input>
            <label>Minuts</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>

        <input>
            <label>Hourly</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>

        <input>
            <label>Daily</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>

        <input>
            <label>Weekly</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>
        <input>
            <label>Monthly</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>
        <input>
            <label>Yearly</label>
            <type type="radio">text</type>
            <name>Pattern</name>
        </input>
    </Recurrence>

    <RepeatedTime>
        <Heading>If you want to Repeated Time</Heading>
        <input>
            <label>Every</label>
            <type type="radio">text</type>
            <name>Every</name>
        </input>

        <input>
            <label>EveryMinutes</label>
            <type type="number">text</type>
            <name>Every_Minutes</name>
        </input>
    </RepeatedTime>

    <Range >
        <Heading>Range Of Recurrence</Heading>

        <input>
            <label>No End Date</label>
            <type type="radio">text</type>
            <name>No_EndDate</name>
        </input>

        <input>
            <label>End After</label>
            <type type="radio">text</type>
            <name>End_After</name>
        </input>
        <input>
            <label>Occurrences</label>
            <type type="number">text</type>
            <name>RangeOccurrences</name>
        </input>
    </Range>
    <End>
        <input>
            <label>End by</label>
            <type type="radio">text</type>
            <name>End by</name>
        </input>

        <input>
            <label>End by</label>
            <type type="number">text</type>
            <name>End by</name>
        </input>
    </End>
</Scheduler>