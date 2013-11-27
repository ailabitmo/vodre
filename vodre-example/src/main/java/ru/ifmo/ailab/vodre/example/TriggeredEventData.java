package ru.ifmo.ailab.vodre.example;

public class TriggeredEventData implements IWorkflowData {
    private String type;
    private String name;

    public TriggeredEventData(String type, String name) {
        this.type = type;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String getType() {
        return type;
    }
}
