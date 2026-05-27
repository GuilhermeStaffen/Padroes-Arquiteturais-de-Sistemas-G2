export interface DomainEvent {
    eventName: string;
    payload: any;
    timestamp: Date;
}

export interface EventPublisher {
    publish(event: DomainEvent): Promise<void>;
}
