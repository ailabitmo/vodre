package ru.ifmo.ailab.vodre.example;

/**
 * Describes triggered rule after some event. Another properties of raised rule would be added later, TODO
 */
public class TriggeredRuleData {
    private String name;

    public TriggeredRuleData(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String value) {
        name = value;
    }
}
